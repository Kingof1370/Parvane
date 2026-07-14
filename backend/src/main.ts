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
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  // Seed the specific admin Parvane Akbarpour (پروانه اکبرپور)
  const targetPhone = '09019667604';
  const targetName = 'پروانه اکبرپور';
  const targetPassword = 'Ali2560199068al@';

  const existingParvane = await userRepo.findOne({ where: { phone: targetPhone } });
  if (!existingParvane) {
    const hash = await bcrypt.hash(targetPassword, 10);
    const parvaneAdmin = userRepo.create({
      email: 'parvane@parvane-salon.ir',
      phone: targetPhone,
      fullName: targetName,
      password: hash,
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    });
    await userRepo.save(parvaneAdmin);
    console.log(`✅ Default Salon Admin seeded: ${targetName} (${targetPhone})`);
  } else {
    let updated = false;
    if (existingParvane.role !== UserRole.ADMIN) {
      existingParvane.role = UserRole.ADMIN;
      updated = true;
    }
    if (!existingParvane.isActive) {
      existingParvane.isActive = true;
      updated = true;
    }
    if (!existingParvane.isVerified) {
      existingParvane.isVerified = true;
      updated = true;
    }
    if (updated) {
      await userRepo.save(existingParvane);
      console.log(`✅ Admin status/role updated for: ${targetName} (${targetPhone})`);
    }
  }

  // Fallback environment admin seeding
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

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
