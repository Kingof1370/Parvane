import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private repo: Repository<Payment>) {}

  async pay(userId: string, appointmentId: string, dto: any) {
    const payment = this.repo.create({
      user: { id: userId },
      appointment: { id: appointmentId },
      amount: dto.amount,
      method: dto.method || PaymentMethod.CASH,
      status: PaymentStatus.SUCCESS,
      refCode: `PAY-${Date.now()}`,
    });
    return this.repo.save(payment);
  }

  findByUser(userId: string) {
    return this.repo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  findAll() {
    return this.repo.find({ relations: ['user', 'appointment'], order: { createdAt: 'DESC' } });
  }
}
