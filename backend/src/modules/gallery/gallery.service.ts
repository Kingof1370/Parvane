import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { StyleGallery, GalleryItemStatus } from './entities/style-gallery.entity';
import { Staff } from '../staff/entities/staff.entity';
import { UserRole } from '../auth/entities/user.entity';

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

  async create(dto: any, userId: string, userRole: UserRole) {
    if (userRole === UserRole.STAFF) {
      const staff = await this.staffRepo.findOne({ where: { userId } });
      if (!staff) throw new ForbiddenException('پروفایل متخصص یافت نشد');
      dto.staffName = staff.fullName;
    }
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: any, userId: string, userRole: UserRole) {
    const item = await this.findOne(id);
    if (userRole === UserRole.STAFF) {
      const staff = await this.staffRepo.findOne({ where: { userId } });
      if (!staff) throw new ForbiddenException('پروفایل متخصص یافت نشد');

      // Specialist can only edit if they are the author or if the item section matches their staff section
      const isAuthor = item.staffName === staff.fullName;
      const isSameSection = staff.section && item.category?.name &&
        item.category.name.toLowerCase().includes(staff.section.toLowerCase());

      if (!isAuthor && !isSameSection) {
        throw new ForbiddenException('شما دسترسی ویرایش این آیتم گالری را ندارید');
      }
    }
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const item = await this.findOne(id);
    if (userRole === UserRole.STAFF) {
      const staff = await this.staffRepo.findOne({ where: { userId } });
      if (!staff) throw new ForbiddenException('پروفایل متخصص یافت نشد');

      const isAuthor = item.staffName === staff.fullName;
      const isSameSection = staff.section && item.category?.name &&
        item.category.name.toLowerCase().includes(staff.section.toLowerCase());

      if (!isAuthor && !isSameSection) {
        throw new ForbiddenException('شما دسترسی حذف این آیتم گالری را ندارید');
      }
    }
    await this.repo.update(id, { isActive: false, status: GalleryItemStatus.ARCHIVED });
    return { message: 'آیتم گالری حذف شد' };
  }

  async like(id: string) {
    await this.repo.increment({ id }, 'likesCount', 1);
    return { message: 'پسند ثبت شد' };
  }
}
