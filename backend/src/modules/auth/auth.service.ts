import {
  Injectable, UnauthorizedException, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`📱 کد تأیید برای ${phone}: ${otp}`);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      user = this.userRepo.create({ phone, fullName: 'کاربر جدید', otp, otpExpiry: expiry });
    } else {
      user.otp = otp;
      user.otpExpiry = expiry;
    }
    await this.userRepo.save(user);

    // In production: send via SMS service
    console.log(`OTP for ${phone}: ${otp}`);
    return { message: "کد تایید ارسال شد", code: otp };
  }

  async verifyOtp(phone: string, otp: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    if (user.otp !== otp) throw new BadRequestException('کد تأیید اشتباه است');
    if (user.otpExpiry < new Date()) throw new BadRequestException('کد تأیید منقضی شده');

    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    await this.userRepo.save(user);

    return this.generateTokens(user);
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: [{ phone: dto.phone }, { email: dto.email }] });
    if (exists) throw new BadRequestException('کاربر با این مشخصات وجود دارد');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hash, isVerified: true });
    await this.userRepo.save(user);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { phone: dto.identifier } })
      || await this.userRepo.findOne({ where: { email: dto.identifier } });
    if (!user || !user.password) throw new UnauthorizedException('مشخصات وارد شده اشتباه است');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('رمز عبور اشتباه است');
    if (!user.isActive) throw new UnauthorizedException('حساب کاربری غیرفعال است');

    return this.generateTokens(user);
  }

  async adminLogin(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.identifier } });
    if (!user || user.role === UserRole.CLIENT) throw new UnauthorizedException('دسترسی غیرمجاز');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('رمز عبور اشتباه است');

    return this.generateTokens(user);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    const { password, otp, otpExpiry, refreshToken, ...result } = user;
    return result;
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.sub, refreshToken: token } });
      if (!user) throw new UnauthorizedException('توکن نامعتبر است');
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده');
    }
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null, fcmToken: null });
    return { message: "کد تایید ارسال شد", code: otp };
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.userRepo.update(userId, { fcmToken });
    return { message: "کد تایید ارسال شد", code: otp };
  }

  async validateUser(userId: string) {
    return this.userRepo.findOne({ where: { id: userId, isActive: true } });
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    await this.userRepo.update(user.id, { refreshToken });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, fullName: user.fullName, phone: user.phone, role: user.role, avatar: user.avatar },
    };
  }
}
