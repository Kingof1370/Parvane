import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  findByUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.count({
      where: { user: { id: userId }, isRead: false },
    });
    return { count };
  }

  async markRead(id: string) {
    await this.repo.update(id, { isRead: true });
    return { message: 'خوانده شد' };
  }

  async markAllRead(userId: string) {
    await this.repo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { message: 'همه خوانده شدند' };
  }

  async create(userId: string, title: string, body: string, type: NotificationType, data?: any) {
    const notif = this.repo.create({ user: { id: userId }, title, body, type, data });
    return this.repo.save(notif);
  }

  async scheduleAftercareReminder(userId: string, appointmentId: string, serviceName: string, scheduledAt: Date) {
    const notif = this.repo.create({
      user: { id: userId },
      title: 'یادآور مراقبت‌های بعد از سرویس 🌸',
      body: `برای بهترین نتیجه از سرویس ${serviceName}، لطفاً توصیه‌های مراقبتی را دنبال کنید.`,
      type: NotificationType.AFTERCARE_REMINDER,
      data: { appointmentId, serviceName },
      scheduledAt,
      isSent: false,
    });
    return this.repo.save(notif);
  }

  async scheduleAppointmentReminder(userId: string, appointmentId: string, appointmentDate: string, startTime: string, staffName: string, scheduledAt: Date) {
    const notif = this.repo.create({
      user: { id: userId },
      title: 'یادآور رزرو نوبت ⏰',
      body: `یادآوری: نوبت شما فردا ${appointmentDate} ساعت ${startTime} نزد ${staffName} تنظیم شده است.`,
      type: NotificationType.APPOINTMENT_REMINDER,
      data: { appointmentId, appointmentDate, startTime, staffName },
      scheduledAt,
      isSent: false,
    });
    return this.repo.save(notif);
  }

  async notifyLoyaltyReward(userId: string, points: number, reason: string) {
    return this.create(
      userId,
      `🎉 ${points} امتیاز وفاداری دریافت کردید`,
      `بابت ${reason} تعداد ${points} امتیاز به کیف امتیاز شما اضافه شد.`,
      NotificationType.LOYALTY_REWARD,
      { points, reason },
    );
  }

  async notifyPrePaymentRequired(userId: string, appointmentId: string, amount: number) {
    return this.create(
      userId,
      'پیش‌پرداخت رزرو 💳',
      `برای تأیید نهایی رزرو شما، لطفاً مبلغ ${amount.toLocaleString('fa')} تومان پیش‌پرداخت کنید.`,
      NotificationType.PRE_PAYMENT_REQUIRED,
      { appointmentId, amount },
    );
  }

  async notifyChatMessage(userId: string, roomId: string, senderName: string, preview: string) {
    return this.create(
      userId,
      `💬 پیام از ${senderName}`,
      preview.length > 80 ? preview.substring(0, 80) + '...' : preview,
      NotificationType.CHAT_NEW_MESSAGE,
      { roomId, senderName },
    );
  }

  async notifyReviewRequest(userId: string, appointmentId: string, staffName: string) {
    return this.create(
      userId,
      'لطفاً نظر خود را ثبت کنید ⭐',
      `نظرتان درباره سرویس ${staffName} برای ما ارزشمند است. با ثبت نظر ۵۰ امتیاز وفاداری دریافت کنید.`,
      NotificationType.REVIEW_REQUEST,
      { appointmentId, staffName },
    );
  }
}
