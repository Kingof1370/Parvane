import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async sendOtp(phone: string) {
    // 1. تولید کد ۶ رقمی تصادفی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. چاپ کد در لاگ (در کنسول Render)
    console.log(`📱 کد تأیید برای ${phone}: ${otpCode}`);

    // 3. ذخیره در دیتابیس (برای تأیید بعدی)
    await this.otpRepository.save({
      phone,
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60000), // ۵ دقیقه اعتبار
    });

    // 4. برگرداندن کد در پاسخ API (به اپلیکیشن)
    return {
      success: true,
      code: otpCode,   // <-- این خط کد را به اپلیکیشن می‌فرستد
      message: 'کد تأیید در لاگ و پاسخ ارسال شد',
    };

    // 5. خط ارسال پیامک را کامنت کنید (غیرفعال)
    // await this.smsService.sendSms(phone, `کد تأیید شما: ${otpCode}`);
  }

  async verifyOtp(phone: string, code: string) {
    // منطق تأیید کد
    const otp = await this.otpRepository.findOne({
      where: { phone, code },
    });
    if (!otp) {
      return { success: false, message: 'کد نامعتبر است' };
    }
    if (new Date() > otp.expiresAt) {
      return { success: false, message: 'کد منقضی شده است' };
    }
    return { success: true, message: 'کد تأیید شد' };
  }
}
