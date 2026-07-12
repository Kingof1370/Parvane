import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalonSetting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(SalonSetting) private repo: Repository<SalonSetting>) {}

  async findAll() {
    const settings = await this.repo.find();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  async updateMany(kv: Record<string, string>) {
    for (const [key, value] of Object.entries(kv)) {
      await this.repo.upsert({ key, value }, ['key']);
    }
    return this.findAll();
  }

  async get(key: string) {
    const setting = await this.repo.findOne({ where: { key } });
    return setting?.value;
  }
}
