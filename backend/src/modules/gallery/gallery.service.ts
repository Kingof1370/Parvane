import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StyleGallery, GalleryItemStatus } from './entities/style-gallery.entity';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class GalleryService {
  constructor(@InjectRepository(StyleGallery) private repo: Repository<StyleGallery>) {}

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

  // متخصص می‌تواند آیتم‌های گالری خودش را ببیند (بر اساس staffName یا staffUserId)
  findByStaff(staffName: string, staffUserId?: string) {
    const qb = this.repo.createQueryBuilder('g')
      .leftJoinAndSelect('g.category', 'category')
      .orderBy('g.sortOrder', 'ASC')
      .addOrderBy('g.createdAt', 'DESC');
    if (staffUserId) {
      qb.where('(g.staffName = :staffName OR g.staffUserId = :staffUserId)', { staffName, staffUserId });
    } else {
      qb.where('g.staffName = :staffName', { staffName });
    }
    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!item) throw new NotFoundException('آیتم گالری یافت نشد');
    await this.repo.increment({ id }, 'viewsCount', 1);
    return item;
  }

  // ادمین - ایجاد آیتم گالری
  create(dto: any) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // متخصص - ایجاد آیتم گالری برای خودش
  createByStaff(dto: any, staffName: string, staffUserId: string) {
    const item = this.repo.create({ ...dto, staffName, staffUserId });
    return this.repo.save(item);
  }

  async update(id: string, dto: any, requesterId?: string, requesterRole?: UserRole) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('آیتم گالری یافت نشد');
    // متخصص فقط آیتم خودش را می‌تواند ویرایش کند
    if (requesterRole === UserRole.STAFF && item.staffUserId !== requesterId) {
      throw new ForbiddenException('فقط می‌توانید آیتم‌های خودتان را ویرایش کنید');
    }
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id }, relations: ['category'] });
  }

  async remove(id: string, requesterId?: string, requesterRole?: UserRole) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('آیتم گالری یافت نشد');
    // متخصص فقط آیتم خودش را حذف کند
    if (requesterRole === UserRole.STAFF && item.staffUserId !== requesterId) {
      throw new ForbiddenException('فقط می‌توانید آیتم‌های خودتان را حذف کنید');
    }
    await this.repo.update(id, { isActive: false, status: GalleryItemStatus.ARCHIVED });
    return { message: 'آیتم گالری حذف شد' };
  }

  async like(id: string) {
    await this.repo.increment({ id }, 'likesCount', 1);
    return { message: 'پسند ثبت شد' };
  }
}
