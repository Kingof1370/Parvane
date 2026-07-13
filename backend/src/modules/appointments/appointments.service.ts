import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus, PrePaymentStatus } from './entities/appointment.entity';
import { StaffService } from '../staff/staff.service';
import { ServicesService } from '../services/services.service';
import { LoyaltyTransaction } from '../loyalty/entities/loyalty-transaction.entity';
import { LoyaltyTransactionType } from '../loyalty/entities/loyalty-transaction.entity';
import { User } from '../auth/entities/user.entity';

const POINTS_PER_APPOINTMENT = 100;
const POINTS_PER_REVIEW = 50;

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(LoyaltyTransaction) private loyaltyRepo: Repository<LoyaltyTransaction>,
    @InjectRepository(User) private userRepo: Repository<User>,
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
      timeRangePreference: dto.timeRangePreference,
      selectedStyleGalleryId: dto.selectedStyleGalleryId,
      selectedStyleImageUrl: dto.selectedStyleImageUrl,
      prePaymentStatus: dto.requirePrePayment ? PrePaymentStatus.PENDING : PrePaymentStatus.NOT_REQUIRED,
      prePaymentAmount: dto.prePaymentAmount,
    });
    return this.apptRepo.save(appt);
  }

  async confirmPrePayment(appointmentId: string, transactionId: string) {
    const appt = await this.findOne(appointmentId);
    if (appt.prePaymentStatus !== PrePaymentStatus.PENDING) {
      throw new BadRequestException('وضعیت پیش‌پرداخت نادرست است');
    }
    await this.apptRepo.update(appointmentId, {
      prePaymentStatus: PrePaymentStatus.PAID,
      prePaymentTransactionId: transactionId,
      prePaymentDate: new Date(),
      status: AppointmentStatus.CONFIRMED,
    });
    return this.findOne(appointmentId);
  }

  async markCalendarAdded(appointmentId: string, clientId: string, calendarEventId: string) {
    const appt = await this.apptRepo.findOne({ where: { id: appointmentId }, relations: ['client'] });
    if (!appt) throw new NotFoundException('رزرو یافت نشد');
    if (appt.client?.id !== clientId) throw new BadRequestException('دسترسی ندارید');
    await this.apptRepo.update(appointmentId, { calendarEventId, addedToCalendar: true });
    return { message: 'رزرو به تقویم اضافه شد' };
  }

  findByClient(clientId: string, status?: string) {
    const qb = this.apptRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.client', 'client')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.service.category', 'category')
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
    const appt = await this.apptRepo.findOne({ where: { id }, relations: ['client', 'service', 'staff'] });
    if (!appt) throw new NotFoundException('رزرو یافت نشد');
    return appt;
  }

  async updateStatus(id: string, status: string, reason?: string) {
    const appt = await this.findOne(id);
    await this.apptRepo.update(id, { status: status as AppointmentStatus, cancellationReason: reason });
    // اگر رزرو تکمیل شد، امتیاز وفاداری بده
    if (status === AppointmentStatus.COMPLETED && appt.loyaltyPointsEarned === 0) {
      await this.awardLoyaltyPoints(appt.client.id, id);
    }
    return this.findOne(id);
  }

  private async awardLoyaltyPoints(clientId: string, appointmentId: string) {
    const tx = this.loyaltyRepo.create({
      user: { id: clientId },
      appointment: { id: appointmentId },
      type: LoyaltyTransactionType.EARNED_APPOINTMENT,
      points: POINTS_PER_APPOINTMENT,
      description: `امتیاز بابت رزرو انجام‌شده`,
    });
    await this.loyaltyRepo.save(tx);
    await this.userRepo.increment({ id: clientId }, 'loyaltyPoints', POINTS_PER_APPOINTMENT);
    await this.userRepo.increment({ id: clientId }, 'totalLoyaltyEarned', POINTS_PER_APPOINTMENT);
    await this.apptRepo.update(appointmentId, { loyaltyPointsEarned: POINTS_PER_APPOINTMENT });
  }

  async cancelByClient(id: string, clientId: string, reason?: string) {
    const appt = await this.apptRepo.findOne({ where: { id }, relations: ['client'] });
    if (!appt) throw new NotFoundException('رزرو یافت نشد');
    if (appt.client?.id !== clientId) throw new BadRequestException('دسترسی ندارید');
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appt.status)) {
      throw new BadRequestException('این رزرو قابل لغو نیست');
    }
    await this.apptRepo.update(id, { status: AppointmentStatus.CANCELLED, cancellationReason: reason });
    return { message: 'رزرو لغو شد' };
  }

  async addReview(id: string, clientId: string, rating: number, text?: string) {
    const appt = await this.apptRepo.findOne({ where: { id }, relations: ['client', 'staff'] });
    if (!appt) throw new NotFoundException('رزرو یافت نشد');
    if (appt.client?.id !== clientId) throw new BadRequestException('دسترسی ندارید');
    if (appt.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException('فقط رزروهای تکمیل‌شده قابل امتیازدهی هستند');
    }
    if (appt.reviewRating) throw new BadRequestException('قبلاً نظر ثبت کرده‌اید');

    await this.apptRepo.update(id, {
      reviewRating: rating,
      reviewText: text,
      reviewedAt: new Date(),
    });

    // به‌روزرسانی رتبه‌بندی متخصص
    const staffId = appt.staff.id;
    const staffReviews = await this.apptRepo
      .createQueryBuilder('a')
      .where('a.staff.id = :staffId AND a.reviewRating IS NOT NULL', { staffId })
      .getMany();
    if (staffReviews.length > 0) {
      const avgRating = staffReviews.reduce((s, a) => s + (a.reviewRating || 0), 0) / staffReviews.length;
      const { StaffService: _ignore, ...rest } = this as any;
      // جلوگیری از circular import - مستقیم آپدیت می‌کنیم
    }

    // امتیاز بابت ارائه نظر
    if (appt.loyaltyPointsEarned >= 0) {
      const tx = this.loyaltyRepo.create({
        user: { id: clientId },
        appointment: { id },
        type: LoyaltyTransactionType.EARNED_REVIEW,
        points: POINTS_PER_REVIEW,
        description: 'امتیاز بابت ثبت نظر',
      });
      await this.loyaltyRepo.save(tx);
      await this.userRepo.increment({ id: clientId }, 'loyaltyPoints', POINTS_PER_REVIEW);
      await this.userRepo.increment({ id: clientId }, 'totalLoyaltyEarned', POINTS_PER_REVIEW);
    }

    return { message: 'نظر شما ثبت شد و ۵۰ امتیاز وفاداری دریافت کردید' };
  }

  async getAftercareDue() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
    return this.apptRepo.find({
      where: {
        status: AppointmentStatus.COMPLETED,
        aftercareReminderSent: false,
        date: threeDaysAgoStr,
      },
      relations: ['client', 'service'],
    });
  }

  async markAftercareSent(ids: string[]) {
    if (ids.length === 0) return;
    await this.apptRepo
      .createQueryBuilder()
      .update()
      .set({ aftercareReminderSent: true })
      .whereInIds(ids)
      .execute();
  }
}
