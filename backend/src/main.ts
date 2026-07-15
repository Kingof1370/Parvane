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
  const email = process.env.ADMIN_EMAIL || 'admin@parvane-salon.ir';
  const password = process.env.ADMIN_PASSWORD || 'Ali2560199068al@';
  const phone = process.env.ADMIN_PHONE || '09019667604';

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  let existing = await userRepo.findOne({
    where: [
      { email },
      { phone },
    ],
  });

  if (existing) {
    // Ensure the role is updated to ADMIN and is active
    if (existing.role !== UserRole.ADMIN || !existing.isActive) {
      existing.role = UserRole.ADMIN;
      existing.isActive = true;
      existing.isVerified = true;
      await userRepo.save(existing);
      console.log(`✅ Admin user role/activation updated for: ${existing.email || existing.phone}`);
    }
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = userRepo.create({
    email,
    phone,
    fullName: 'پروانه اکبرپور',
    password: hash,
    role: UserRole.ADMIN,
    isActive: true,
    isVerified: true,
  });
  await userRepo.save(admin);
  console.log(`✅ Admin user seeded: ${email} (${phone})`);
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
