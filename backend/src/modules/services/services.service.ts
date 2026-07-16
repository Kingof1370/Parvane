import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalonService, ServiceCategory } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(SalonService) private serviceRepo: Repository<SalonService>,
    @InjectRepository(ServiceCategory) private categoryRepo: Repository<ServiceCategory>,
  ) {}

  async findAll(categoryId?: string) {
    const qb = this.serviceRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.category', 'cat')
      .where('s.isActive = true');
    if (categoryId) qb.andWhere('cat.id = :categoryId', { categoryId });
    return qb.orderBy('s.sortOrder', 'ASC').getMany();
  }

  async getCategories() {
    return this.categoryRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string) {
    const service = await this.serviceRepo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('خدمت یافت نشد');
    return service;
  }

  async create(dto: any) {
    const service = this.serviceRepo.create(dto);
    return this.serviceRepo.save(service);
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    await this.serviceRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.serviceRepo.update(id, { isActive: false });
    return { message: 'خدمت حذف شد' };
  }

  async createCategory(dto: any) {
    const cat = this.categoryRepo.create(dto);
    return this.categoryRepo.save(cat);
  }
}
