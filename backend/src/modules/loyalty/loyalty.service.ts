import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyTransaction, LoyaltyTransactionType } from './entities/loyalty-transaction.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyTransaction) private txRepo: Repository<LoyaltyTransaction>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getUserPoints(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    const transactions = await this.txRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return {
      balance: user.loyaltyPoints,
      totalEarned: user.totalLoyaltyEarned,
      totalRedeemed: user.totalLoyaltyRedeemed,
      transactions,
    };
  }

  async earnPoints(userId: string, points: number, type: LoyaltyTransactionType, description: string, appointmentId?: string) {
    const tx = this.txRepo.create({
      user: { id: userId },
      appointment: appointmentId ? { id: appointmentId } : undefined,
      type,
      points,
      description,
    });
    await this.txRepo.save(tx);
    await this.userRepo.increment({ id: userId }, 'loyaltyPoints', points);
    await this.userRepo.increment({ id: userId }, 'totalLoyaltyEarned', points);
    return tx;
  }

  async redeemPoints(userId: string, points: number, description: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.loyaltyPoints < points) {
      throw new BadRequestException(`امتیاز کافی ندارید. موجودی شما: ${user.loyaltyPoints} امتیاز`);
    }
    const tx = this.txRepo.create({
      user: { id: userId },
      type: LoyaltyTransactionType.REDEEMED_DISCOUNT,
      points: -points,
      description,
    });
    await this.txRepo.save(tx);
    await this.userRepo.decrement({ id: userId }, 'loyaltyPoints', points);
    await this.userRepo.increment({ id: userId }, 'totalLoyaltyRedeemed', points);
    return { message: 'امتیاز با موفقیت استفاده شد', remaining: user.loyaltyPoints - points };
  }

  async adminAdjust(userId: string, points: number, description: string, adminId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    const tx = this.txRepo.create({
      user: { id: userId },
      type: LoyaltyTransactionType.ADMIN_ADJUSTMENT,
      points,
      description,
    });
    await this.txRepo.save(tx);
    if (points > 0) {
      await this.userRepo.increment({ id: userId }, 'loyaltyPoints', points);
      await this.userRepo.increment({ id: userId }, 'totalLoyaltyEarned', points);
    } else {
      const decrement = Math.abs(points);
      const newBalance = Math.max(0, user.loyaltyPoints - decrement);
      await this.userRepo.update(userId, { loyaltyPoints: newBalance });
    }
    return { message: 'امتیاز اصلاح شد' };
  }

  async getAllUsersPoints() {
    return this.userRepo.find({
      select: ['id', 'fullName', 'phone', 'loyaltyPoints', 'totalLoyaltyEarned', 'totalLoyaltyRedeemed'],
      order: { loyaltyPoints: 'DESC' },
    });
  }

  async getUserTransactions(userId: string) {
    return this.txRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
