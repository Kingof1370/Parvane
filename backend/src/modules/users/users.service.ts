import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  private safeUser(user: User) {
    const { password, otp, otpExpiry, refreshToken, ...safe } = user;
    return safe;
  }

  async updateProfile(id: string, dto: any) {
    const { password, role, ...safe } = dto;
    await this.repo.update(id, safe);
    const user = await this.repo.findOne({ where: { id } });
    return this.safeUser(user);
  }

  async findAll(search?: string) {
    let users: User[];
    if (search) {
      users = await this.repo.find({
        where: [
          { fullName: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    } else {
      users = await this.repo.find({ order: { createdAt: 'DESC' } });
    }
    return users.map(u => this.safeUser(u));
  }

  async findClients(search?: string) {
    let users: User[];
    if (search) {
      users = await this.repo.find({
        where: [
          { role: UserRole.CLIENT, fullName: Like(`%${search}%`) },
          { role: UserRole.CLIENT, phone: Like(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    } else {
      users = await this.repo.find({ where: { role: UserRole.CLIENT }, order: { createdAt: 'DESC' } });
    }
    return users.map(u => this.safeUser(u));
  }

  async findStaffUsers() {
    const users = await this.repo.find({
      where: [{ role: UserRole.STAFF }, { role: UserRole.ADMIN }],
      order: { createdAt: 'DESC' },
    });
    return users.map(u => this.safeUser(u));
  }

  async toggleActive(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    await this.repo.update(id, { isActive: !user.isActive });
    return { message: user.isActive ? 'کاربر غیرفعال شد' : 'کاربر فعال شد' };
  }

  // مدیریت نقش کاربران - مثل ادمین تلگرام
  async changeRole(id: string, role: UserRole, staffSection?: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    const update: Partial<User> = { role };
    if (staffSection) update.staffSection = staffSection;
    await this.repo.update(id, update);
    const updated = await this.repo.findOne({ where: { id } });
    return this.safeUser(updated);
  }

  // ساخت کاربر متخصص توسط ادمین
  async createStaffUser(dto: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    staffSection?: string;
  }) {
    const exists = await this.repo.findOne({ where: { phone: dto.phone } });
    if (exists) throw new BadRequestException('کاربر با این شماره قبلاً ثبت‌نام کرده است');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      ...dto,
      password: hash,
      role: UserRole.STAFF,
      isVerified: true,
      isActive: true,
    });
    const saved = await this.repo.save(user);
    return this.safeUser(saved);
  }

  // تغییر رمز عبور توسط ادمین
  async resetPassword(id: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { password: hash });
    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  // تغییر رمز عبور توسط خود کاربر
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (!user.password) throw new BadRequestException('رمز عبور تنظیم نشده');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('رمز عبور فعلی اشتباه است');
    const hash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { password: hash });
    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return this.safeUser(user);
  }

  // گرفتن FCM توکن‌های همه کاربران (برای ارسال نوتیفیکیشن گروهی)
  async getAllFcmTokens(): Promise<string[]> {
    const users = await this.repo.find({
      where: { isActive: true },
      select: ['fcmToken'],
    });
    return users.map(u => u.fcmToken).filter(t => !!t);
  }

  async getFcmTokensByRole(role: UserRole): Promise<string[]> {
    const users = await this.repo.find({
      where: { isActive: true, role },
      select: ['fcmToken'],
    });
    return users.map(u => u.fcmToken).filter(t => !!t);
  }
}
