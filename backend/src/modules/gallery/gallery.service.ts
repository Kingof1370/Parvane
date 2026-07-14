import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StyleGallery, GalleryItemStatus } from './entities/style-gallery.entity';
import { UserRole } from '../auth/entities/user.entity';
import { Staff } from '../staff/entities/staff.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(StyleGallery) private repo: Repository<StyleGallery>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
  ) {}

  findAll(categoryId?: string, tag?: string, search?: string) {
    const qb = this.repo.createQueryBuilder('g')
      .leftJoinAndSelect('g.category', 'category')
      .where('g.isActive = true AND g.status = :status', { status: GalleryItemStatus.ACTIVE })
      .orderBy('g.sortOrder', 'ASC')
      .addOrderBy('g.createdAt', 'DESC');
    if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });
    if (search) qb.andWhere('(g.title ILIKE :search OR g.description ILIKE :search)', { search: `%${search}%` });
    if (tag) qb.andWhere(':tag = ANY(g.tags)', { tag });
    return qb.getMany();
  }

  findAllAdmin() {
    return this.repo.find({
      relations: ['category'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!item) throw new NotFoundException('آیتم گالری یافت نشد');
    await this.repo.increment({ id }, 'viewsCount', 1);
    return item;
  }

  async create(dto: any, requesterId: string, requesterRole: UserRole) {
    if (requesterRole === UserRole.STAFF) {
      const staff = await this.staffRepo.findOne({ where: { userId: requesterId } });
      if (!staff) throw new ForbiddenException('اطلاعات متخصص شما یافت نشد');
      dto.staffName = staff.fullName;
    }
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: any, requesterId: string, requesterRole: UserRole) {
    const existing = await this.findOne(id);
    if (requesterRole === UserRole.STAFF) {
      const staff = await this.staffRepo.findOne({ where: { userId: requesterId } });
      if (!staff || existing.staffName !== staff.fullName) {
        throw new ForbiddenException('شما فقط می‌توانید استایل‌های مربوط به خودتان را ویرایش کنید');
      }
      dto.staffName = staff.fullName;
    }
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.update(id, { isActive: false, status: GalleryItemStatus.ARCHIVED });
    return { message: 'آیتم گالری حذف شد' };
  }

  async like(id: string) {
    await this.repo.increment({ id }, 'likesCount', 1);
    return { message: 'پسند ثبت شد' };
  }
}
