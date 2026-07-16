import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { StaffPortfolio, PortfolioItemType } from './entities/staff-portfolio.entity';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(StaffPortfolio) private portfolioRepo: Repository<StaffPortfolio>,
  ) {}

  findAll() {
    return this.staffRepo.find({
      where: { isActive: true },
      relations: ['specialties'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string) {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['specialties', 'portfolio'],
    });
    if (!staff) throw new NotFoundException('متخصص یافت نشد');
    return staff;
  }

  async getAvailability(staffId: string, date: string) {
    const staff = await this.findOne(staffId);
    const d = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[d.getDay()];
    const hours = staff.workingHours?.[dayName];
    if (!hours || hours.isOff) return { available: false, slots: [] };
    const slots: string[] = [];
    let cur = this.parseTime(hours.start);
    const end = this.parseTime(hours.end);
    while (cur + 30 <= end) {
      slots.push(this.formatTime(cur));
      cur += 30;
    }
    return { available: true, slots };
  }

  private parseTime(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private formatTime(mins: number) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  create(dto: any) {
    const staff = this.staffRepo.create(dto);
    return this.staffRepo.save(staff);
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    await this.staffRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.staffRepo.update(id, { isActive: false });
    return { message: 'متخصص حذف شد' };
  }

  // --- پورتفولیو ---

  async getPortfolio(staffId: string) {
    const staff = await this.findOne(staffId);
    return this.portfolioRepo.find({
      where: { staff: { id: staffId }, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async getPortfolioAdmin(staffId: string) {
    return this.portfolioRepo.find({
      where: { staff: { id: staffId } },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async addPortfolioItem(staffId: string, dto: {
    title: string;
    description?: string;
    imageUrl: string;
    beforeImageUrl?: string;
    type?: PortfolioItemType;
    serviceCategory?: string;
    sortOrder?: number;
  }, requesterId: string, requesterRole: UserRole) {
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new NotFoundException('متخصص یافت نشد');
    // متخصص فقط برای پروفایل خودش می‌تواند نمونه‌کار اضافه کند
    if (requesterRole === UserRole.STAFF && staff.userId !== requesterId) {
      throw new ForbiddenException('فقط می‌توانید به پروفایل خود نمونه‌کار اضافه کنید');
    }
    const item = this.portfolioRepo.create({ staff: { id: staffId }, ...dto });
    return this.portfolioRepo.save(item);
  }

  async updatePortfolioItem(itemId: string, dto: any, requesterId: string, requesterRole: UserRole) {
    const item = await this.portfolioRepo.findOne({ where: { id: itemId }, relations: ['staff'] });
    if (!item) throw new NotFoundException('آیتم پورتفولیو یافت نشد');
    if (requesterRole === UserRole.STAFF && item.staff.userId !== requesterId) {
      throw new ForbiddenException('دسترسی ندارید');
    }
    await this.portfolioRepo.update(itemId, dto);
    return this.portfolioRepo.findOne({ where: { id: itemId }, relations: ['staff'] });
  }

  async removePortfolioItem(itemId: string, requesterId: string, requesterRole: UserRole) {
    const item = await this.portfolioRepo.findOne({ where: { id: itemId }, relations: ['staff'] });
    if (!item) throw new NotFoundException('آیتم پورتفولیو یافت نشد');
    if (requesterRole === UserRole.STAFF && item.staff.userId !== requesterId) {
      throw new ForbiddenException('دسترسی ندارید');
    }
    await this.portfolioRepo.update(itemId, { isActive: false });
    return { message: 'آیتم پورتفولیو حذف شد' };
  }

  async updatePermissions(staffId: string, permissions: string[]) {
    await this.staffRepo.update(staffId, { permissions: permissions as any });
    return this.findOne(staffId);
  }

  async linkUserAccount(staffId: string, userId: string) {
    await this.staffRepo.update(staffId, { userId });
    return { message: 'حساب کاربری متخصص لینک شد' };
  }
}
