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

async function seedAdmin(app: import('@nestjs/common').INestApplicationContext) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) return;

  const hash = await bcrypt.hash(password, 10);
  const admin = userRepo.create({
    email,
    phone: process.env.ADMIN_PHONE || '09000000000',
    fullName: 'مدیر سالن',
    password: hash,
    role: UserRole.ADMIN,
    isActive: true,
    isVerified: true,
  });
  await userRepo.save(admin);
  console.log(`✅ Admin user seeded: ${email}`);
}

async function bootstrap() {
  // اطمینان از وجود پوشه uploads
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
    console.log('📁 uploads directory created');
  }

  const app = await NestFactory.create(AppModule);

  await seedAdmin(app);

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());

  // سرو فایل‌های استاتیک (تصاویر آپلودشده)
  app.use('/uploads', express.static(uploadDir));

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

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger docs
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
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
