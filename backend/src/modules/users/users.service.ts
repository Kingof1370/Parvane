import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async updateProfile(id: string, dto: any) {
    const { password, role, ...safe } = dto;
    await this.repo.update(id, safe);
    const user = await this.repo.findOne({ where: { id } });
    const { password: p, otp, otpExpiry, refreshToken, ...result } = user;
    return result;
  }

  findAll(search?: string) {
    if (search) {
      return this.repo.find({
        where: [
          { fullName: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async toggleActive(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    await this.repo.update(id, { isActive: !user.isActive });
    return { message: user.isActive ? 'کاربر غیرفعال شد' : 'کاربر فعال شد' };
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    await this.repo.update(id, { role });
    return { message: 'نقش کاربر با موفقیت تغییر یافت' };
  }

  async deleteUser(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    await this.repo.remove(user);
    return { message: 'کاربر با موفقیت حذف شد' };
  }
}
