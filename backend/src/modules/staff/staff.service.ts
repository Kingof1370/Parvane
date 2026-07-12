import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(@InjectRepository(Staff) private staffRepo: Repository<Staff>) {}

  findAll() {
    return this.staffRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string) {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('متخصص یافت نشد');
    return staff;
  }

  async getAvailability(staffId: string, date: string) {
    const staff = await this.findOne(staffId);
    const d = new Date(date);
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
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
}
