import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
    private configService: ConfigService,
  ) {}

  findByUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
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
    const notif = this.repo.create({ user: { id: userId }, title, body, type, data, isSent: true });
    return this.repo.save(notif);
  }

  // ارسال Push Notification از طریق FCM
  async sendPushToToken(fcmToken: string, title: string, body: string, data?: Record<string, string>) {
    const serverKey = this.configService.get('FCM_SERVER_KEY');
    if (!serverKey || !fcmToken) return;

    try {
      const payload = {
        to: fcmToken,
        notification: { title, body, sound: 'default' },
        data: data || {},
        priority: 'high',
        android: { priority: 'high', notification: { channel_id: 'parvane_channel', sound: 'default' } },
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (err) {
      console.error('FCM error:', err);
      return false;
    }
  }

  async sendPushToTokens(fcmTokens: string[], title: string, body: string, data?: Record<string, string>) {
    if (!fcmTokens.length) return;
    const serverKey = this.configService.get('FCM_SERVER_KEY');
    if (!serverKey) return;

    try {
      const payload = {
        registration_ids: fcmTokens.slice(0, 1000), // حداکثر ۱۰۰۰ توکن
        notification: { title, body, sound: 'default' },
        data: data || {},
        priority: 'high',
        android: { priority: 'high', notification: { channel_id: 'parvane_channel', sound: 'default' } },
      };

      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('FCM batch error:', err);
    }
  }

  // ارسال اعلان + ذخیره در DB + push
  async notify(userId: string, title: string, body: string, type: NotificationType, data?: any, fcmToken?: string) {
    const notif = await this.create(userId, title, body, type, data);
    if (fcmToken) {
      await this.sendPushToToken(fcmToken, title, body, { type, notificationId: notif.id, ...data });
    }
    return notif;
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

  async scheduleAppointmentReminder(
    userId: string,
    appointmentId: string,
    appointmentDate: string,
    startTime: string,
    staffName: string,
    scheduledAt: Date,
  ) {
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

  async notifyAppointmentConfirmed(userId: string, appointmentId: string, staffName: string, date: string, time: string, fcmToken?: string) {
    return this.notify(
      userId,
      '✅ رزرو شما تأیید شد',
      `رزرو شما نزد ${staffName} برای تاریخ ${date} ساعت ${time} تأیید شد.`,
      NotificationType.APPOINTMENT_CONFIRMED,
      { appointmentId, staffName, date, time },
      fcmToken,
    );
  }

  async notifyAppointmentCancelled(userId: string, appointmentId: string, reason?: string, fcmToken?: string) {
    return this.notify(
      userId,
      '❌ رزرو لغو شد',
      reason ? `رزرو شما لغو شد. دلیل: ${reason}` : 'رزرو شما لغو شد.',
      NotificationType.APPOINTMENT_CANCELLED,
      { appointmentId, reason },
      fcmToken,
    );
  }

  async notifyLoyaltyReward(userId: string, points: number, reason: string, fcmToken?: string) {
    return this.notify(
      userId,
      `🎉 ${points} امتیاز وفاداری دریافت کردید`,
      `بابت ${reason} تعداد ${points} امتیاز به کیف امتیاز شما اضافه شد.`,
      NotificationType.LOYALTY_REWARD,
      { points: String(points), reason },
      fcmToken,
    );
  }

  async notifyPrePaymentRequired(userId: string, appointmentId: string, amount: number, fcmToken?: string) {
    return this.notify(
      userId,
      'پیش‌پرداخت رزرو 💳',
      `برای تأیید نهایی رزرو شما، لطفاً مبلغ ${amount.toLocaleString('fa')} تومان پیش‌پرداخت کنید.`,
      NotificationType.PRE_PAYMENT_REQUIRED,
      { appointmentId, amount: String(amount) },
      fcmToken,
    );
  }

  async notifyChatMessage(userId: string, roomId: string, senderName: string, preview: string, fcmToken?: string) {
    return this.notify(
      userId,
      `💬 پیام از ${senderName}`,
      preview.length > 80 ? preview.substring(0, 80) + '...' : preview,
      NotificationType.CHAT_NEW_MESSAGE,
      { roomId, senderName },
      fcmToken,
    );
  }

  async notifyReviewRequest(userId: string, appointmentId: string, staffName: string, fcmToken?: string) {
    return this.notify(
      userId,
      'لطفاً نظر خود را ثبت کنید ⭐',
      `نظرتان درباره سرویس ${staffName} برای ما ارزشمند است. با ثبت نظر ۵۰ امتیاز وفاداری دریافت کنید.`,
      NotificationType.REVIEW_REQUEST,
      { appointmentId, staffName },
      fcmToken,
    );
  }

  // ارسال اعلان عمومی به همه کاربران (ادمین)
  async broadcast(title: string, body: string, type: NotificationType = NotificationType.GENERAL, userIds: string[], fcmTokens: string[]) {
    // ذخیره در DB برای همه
    const notifs = userIds.map(userId =>
      this.repo.create({ user: { id: userId }, title, body, type, isSent: true }),
    );
    await this.repo.save(notifs);

    // ارسال Push به همه
    if (fcmTokens.length > 0) {
      await this.sendPushToTokens(fcmTokens, title, body, { type });
    }

    return { message: `اعلان برای ${userIds.length} کاربر ارسال شد`, count: userIds.length };
  }

  // اعلان‌های برنامه‌ریزی‌شده که باید ارسال شوند
  async getPendingScheduled() {
    return this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.user', 'user')
      .where('n.isSent = false')
      .andWhere('n.scheduledAt <= :now', { now: new Date() })
      .getMany();
  }

  async markSent(id: string) {
    await this.repo.update(id, { isSent: true });
  }
}
