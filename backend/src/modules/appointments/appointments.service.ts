import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { StaffService } from '../staff/staff.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    private staffService: StaffService,
    private servicesService: ServicesService,
  ) {}

  async getAvailableSlots(staffId: string, serviceId: string, date: string) {
    const [staff, service] = await Promise.all([
      this.staffService.findOne(staffId),
      this.servicesService.findOne(serviceId),
    ]);

    const availability = await this.staffService.getAvailability(staffId, date);
    if (!availability.available) return { slots: [] };

    // Get booked slots for this staff on this date
    const booked = await this.apptRepo.find({
      where: { date, staff: { id: staffId } },
      select: ['startTime', 'endTime', 'status'],
    });

    const bookedSlots = booked
      .filter(a => a.status !== AppointmentStatus.CANCELLED)
      .map(a => ({ start: this.timeToMins(a.startTime), end: this.timeToMins(a.endTime) }));

    const duration = service.durationMinutes;
    const available = (availability.slots as string[]).filter(slot => {
      const slotStart = this.timeToMins(slot);
      const slotEnd = slotStart + duration;
      return !bookedSlots.some(b => slotStart < b.end && slotEnd > b.start);
    });

    return { slots: available, duration };
  }

  private timeToMins(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private minsToTime(m: number) {
    return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
  }

  async create(clientId: string, dto: any) {
    const service = await this.servicesService.findOne(dto.serviceId);
    const startMins = this.timeToMins(dto.startTime);
    const endTime = this.minsToTime(startMins + service.durationMinutes);

    // Check for conflicts
    const conflict = await this.apptRepo.findOne({
      where: { date: dto.date, staff: { id: dto.staffId }, startTime: dto.startTime },
    });
    if (conflict && conflict.status !== AppointmentStatus.CANCELLED) {
      throw new BadRequestException('این زمان رزرو شده است');
    }

    const appt = this.apptRepo.create({
      client: { id: clientId },
      service: { id: dto.serviceId },
      staff: { id: dto.staffId },
      date: dto.date,
      startTime: dto.startTime,
      endTime,
      notes: dto.notes,
      status: AppointmentStatus.PENDING,
    });
    return this.apptRepo.save(appt);
  }

  findByClient(clientId: string, status?: string) {
    const qb = this.apptRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.client', 'client')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.staff', 'staff')
      .where('client.id = :clientId', { clientId })
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.startTime', 'DESC');
    if (status) qb.andWhere('a.status = :status', { status });
    return qb.getMany();
  }

  findAll(filters: { date?: string; staffId?: string; status?: string }) {
    const qb = this.apptRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.client', 'client')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.staff', 'staff')
      .orderBy('a.date', 'ASC')
      .addOrderBy('a.startTime', 'ASC');
    if (filters.date) qb.andWhere('a.date = :date', { date: filters.date });
    if (filters.staffId) qb.andWhere('staff.id = :staffId', { staffId: filters.staffId });
    if (filters.status) qb.andWhere('a.status = :status', { status: filters.status });
    return qb.getMany();
  }

  async findOne(id: string) {
    const appt = await this.apptRepo.findOne({ where: { id } });
    if (!appt) throw new NotFoundException('رزرو یافت نشد');
    return appt;
  }

  async updateStatus(id: string, status: string, reason?: string) {
    await this.findOne(id);
    await this.apptRepo.update(id, { status: status as AppointmentStatus, cancellationReason: reason });
    return this.findOne(id);
  }

  async cancelByClient(id: string, clientId: string, reason?: string) {
    const appt = await this.findOne(id);
    if ((appt.client as any).id !== clientId) throw new BadRequestException('دسترسی ندارید');
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appt.status)) {
      throw new BadRequestException('این رزرو قابل لغو نیست');
    }
    await this.apptRepo.update(id, { status: AppointmentStatus.CANCELLED, cancellationReason: reason });
    return { message: 'رزرو لغو شد' };
  }

  async addReview(id: string, clientId: string, rating: number, text?: string) {
    const appt = await this.findOne(id);
    if ((appt.client as any).id !== clientId) throw new BadRequestException('دسترسی ندارید');
    if (appt.status !== AppointmentStatus.COMPLETED) throw new BadRequestException('فقط رزروهای تکمیل‌شده قابل امتیازدهی هستند');
    await this.apptRepo.update(id, { reviewRating: rating, reviewText: text });
    return { message: 'نظر شما ثبت شد' };
  }
}
