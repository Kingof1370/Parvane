import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { User, UserRole } from './modules/auth/entities/user.entity';
import * as compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as express from 'express';

/**
 * ایجاد یا بروزرسانی کاربر ادمین هنگام راه‌اندازی سرور.
 * متغیرهای محیطی مورد نیاز در Render:
 *   ADMIN_PHONE    – شماره موبایل ادمین
 *   ADMIN_PASSWORD – رمز عبور ادمین
 *   ADMIN_NAME     – نام کامل ادمین (اختیاری، پیش‌فرض: مدیر سالن)
 *   ADMIN_EMAIL    – ایمیل ادمین (اختیاری)
 */
async function seedAdmin(app: import('@nestjs/common').INestApplicationContext) {
  const phone    = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_NAME  || 'مدیر سالن';
  const email    = process.env.ADMIN_EMAIL || undefined;

  if (!phone || !password) {
    console.log('⚠️  ADMIN_PHONE یا ADMIN_PASSWORD تنظیم نشده - seed ادمین رد شد');
    return;
  }

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  // جستجو بر اساس شماره موبایل (اولویت) یا ایمیل
  let existing = await userRepo.findOne({ where: { phone } });
  if (!existing && email) {
    existing = await userRepo.findOne({ where: { email } });
  }

  const hash = await bcrypt.hash(password, 10);

  if (existing) {
    // بروزرسانی کاربر موجود: نقش، نام، رمز و فعال‌سازی
    await userRepo.update(existing.id, {
      role: UserRole.ADMIN,
      fullName,
      password: hash,
      phone,
      ...(email ? { email } : {}),
      isActive: true,
      isVerified: true,
    });
    console.log(`✅ ادمین بروزرسانی شد: ${fullName} (${phone})`);
  } else {
    // ایجاد کاربر ادمین جدید
    const admin = userRepo.create({
      phone,
      email,
      fullName,
      password: hash,
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    });
    await userRepo.save(admin);
    console.log(`✅ ادمین ایجاد شد: ${fullName} (${phone})`);
  }
}

async function bootstrap() {
  // اطمینان از وجود پوشه uploads
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
    console.log('📁 پوشه uploads ایجاد شد');
  }

  const app = await NestFactory.create(AppModule);

  // Seed ادمین قبل از هر چیز دیگری
  await seedAdmin(app);

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());

  // سرو فایل‌های استاتیک آپلودشده
  app.use('/uploads', express.static(uploadDir));

  // ───── پنل ادمین (فایل‌های build شده Vite) ─────
  const adminDistPath = join(process.cwd(), 'admin-dist');
  if (existsSync(adminDistPath)) {
    // فایل‌های asset (js، css، تصاویر)
    app.use('/admin', express.static(adminDistPath));
    // SPA fallback: همه route های داخل /admin → index.html
    app.use('/admin', (_req: any, res: any) => {
      res.sendFile(join(adminDistPath, 'index.html'));
    });
    console.log('🖥️  پنل ادمین در دسترس است: /admin');
  }
  // ────────────────────────────────────────────────

  // CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // پیشوند عمومی برای API
  app.setGlobalPrefix('api/v1');

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('سالن زیبایی پروانه اکبرپور')
    .setDescription('API سیستم مدیریت سالن زیبایی پروانه اکبرپور')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 سرور روی پورت ${port} اجرا شد`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
  console.log(`🖥️  پنل ادمین: http://localhost:${port}/admin`);
}

bootstrap();
