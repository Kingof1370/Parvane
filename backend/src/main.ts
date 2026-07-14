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
  const app = await NestFactory.create(AppModule);

  await seedAdmin(app);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS with specific allowed origins (from env or default local/production salon admin domains)
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://parvanesalon.ir',
        'https://admin.parvanesalon.ir',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Set Request Payload Limits to prevent denial of service (DoS) attacks using NestJS express platform configuration
  const express = require('express');
  const appRef = app.getHttpAdapter().getInstance();
  appRef.use(express.json({ limit: '10mb' }));
  appRef.use(express.urlencoded({ limit: '10mb', extended: true }));

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
