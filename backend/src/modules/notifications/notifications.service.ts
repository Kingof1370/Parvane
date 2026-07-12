import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  findByUser(userId: string) {
    return this.repo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    await this.repo.update(id, { isRead: true });
    return { message: 'خوانده شد' };
  }

  async markAllRead(userId: string) {
    await this.repo.update({ user: { id: userId }, isRead: false }, { isRead: true });
    return { message: 'همه خوانده شدند' };
  }

  async create(userId: string, title: string, body: string, type: NotificationType, data?: any) {
    const notif = this.repo.create({ user: { id: userId }, title, body, type, data });
    return this.repo.save(notif);
  }
}
