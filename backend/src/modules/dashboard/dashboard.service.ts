import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { SalonService } from '../services/entities/service.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(SalonService) private serviceRepo: Repository<SalonService>,
  ) {}

  async getSummary() {
    const today = new Date().toISOString().split('T')[0];
    const [todayAppts, pendingAppts, totalClients, totalRevenue, totalStaff] = await Promise.all([
      this.apptRepo.count({ where: { date: today } }),
      this.apptRepo.count({ where: { status: AppointmentStatus.PENDING } }),
      this.userRepo.count({ where: { role: UserRole.CLIENT } }),
      this.apptRepo
        .createQueryBuilder('a')
        .select('SUM(a.paidAmount)', 'total')
        .where('a.status = :status', { status: AppointmentStatus.COMPLETED })
        .getRawOne(),
      this.userRepo.count({ where: { role: UserRole.STAFF } }),
    ]);
    return {
      todayAppointments: todayAppts,
      pendingAppointments: pendingAppts,
      totalClients,
      totalStaff,
      totalRevenue: totalRevenue?.total || 0,
    };
  }

  async getRevenue(from: string, to: string) {
    const result = await this.apptRepo
      .createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect('SUM(a.paidAmount)', 'revenue')
      .where('a.date BETWEEN :from AND :to', { from, to })
      .andWhere('a.status = :status', { status: AppointmentStatus.COMPLETED })
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();
    return result;
  }

  async getPopularServices() {
    return this.apptRepo
      .createQueryBuilder('a')
      .select('service.name', 'name')
      .addSelect('COUNT(a.id)', 'count')
      .leftJoin('a.service', 'service')
      .where('a.status = :status', { status: AppointmentStatus.COMPLETED })
      .groupBy('service.id')
      .addGroupBy('service.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getAppointmentsChart(days: number) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      const count = await this.apptRepo.count({ where: { date } });
      results.push({ date, count });
    }
    return results;
  }

  async getClientsStats() {
    const total = await this.userRepo.count({ where: { role: UserRole.CLIENT } });
    const active = await this.userRepo.count({ where: { role: UserRole.CLIENT, isActive: true } });
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newThisMonth = await this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.CLIENT })
      .andWhere('u.createdAt >= :date', { date: thisMonth })
      .getCount();
    return { total, active, inactive: total - active, newThisMonth };
  }

  async getRecentAppointments(limit: number = 10) {
    return this.apptRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.client', 'client')
      .leftJoinAndSelect('a.service', 'service')
      .leftJoinAndSelect('a.staff', 'staff')
      .orderBy('a.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
