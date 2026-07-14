import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { User, UserRole } from './modules/auth/entities/user.entity';
import { ServiceCategory, SalonService } from './modules/services/entities/service.entity';
import { Staff } from './modules/staff/entities/staff.entity';
import { StyleGallery } from './modules/gallery/entities/style-gallery.entity';
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

async function seedSalonData(app: import('@nestjs/common').INestApplicationContext) {
  const categoryRepo = app.get<Repository<ServiceCategory>>(getRepositoryToken(ServiceCategory));
  const serviceRepo = app.get<Repository<SalonService>>(getRepositoryToken(SalonService));
  const staffRepo = app.get<Repository<Staff>>(getRepositoryToken(Staff));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const galleryRepo = app.get<Repository<StyleGallery>>(getRepositoryToken(StyleGallery));

  const count = await categoryRepo.count();
  if (count > 0) return;

  console.log('🌱 Seeding beauty salon categories, services, staff profiles, and style gallery...');

  // 1. Create categories (sections of the salon)
  const catHair = categoryRepo.create({ name: 'کوتاهی و استایل مو', sortOrder: 1, isActive: true });
  const catColor = categoryRepo.create({ name: 'رنگ و لایت تخصصی', sortOrder: 2, isActive: true });
  const catNail = categoryRepo.create({ name: 'کاشت و دیزاین ناخن', sortOrder: 3, isActive: true });
  const catSkin = categoryRepo.create({ name: 'پوست و فیشیال', sortOrder: 4, isActive: true });
  const catMakeup = categoryRepo.create({ name: 'میکاپ و آرایش عروس', sortOrder: 5, isActive: true });

  const cats = await categoryRepo.save([catHair, catColor, catNail, catSkin, catMakeup]);
  const [savedHair, savedColor, savedNail, savedSkin, savedMakeup] = cats;

  // 2. Create services with prices and durations
  const svcHair1 = serviceRepo.create({ name: 'کوتاهی ژورنالی', description: 'کوتاهی مو طبق ژورنال روز اروپا همراه با سشوار و فرم‌دهی حرفه‌ای', price: 350000, durationMinutes: 45, category: savedHair, sortOrder: 1 });
  const svcHair2 = serviceRepo.create({ name: 'براشینگ حرفه‌ای', description: 'حالت‌دهی مجلسی مو، فر یا صاف به انتخاب مشتری', price: 200000, durationMinutes: 30, category: savedHair, sortOrder: 2 });
  const svcHair3 = serviceRepo.create({ name: 'کراتینه و احیای مو', description: 'احیا و صافی ۱۰۰ درصد موهای آسیب‌دیده با مواد برزیلی بدون فرمالدئید', price: 2500000, durationMinutes: 120, category: savedHair, sortOrder: 3 });

  const svcColor1 = serviceRepo.create({ name: 'بالیاژ مو', description: 'تکنیک بالیاژ روسی همراه با پلکس‌تراپی جهت حفظ سلامت کامل موها', price: 3500000, durationMinutes: 180, category: savedColor, sortOrder: 1 });
  const svcColor2 = serviceRepo.create({ name: 'رنگ کامل مو', description: 'رنگ مو با استفاده از رنگ‌های بدون آمونیاک آلمانی', price: 1200000, durationMinutes: 90, category: savedColor, sortOrder: 2 });

  const svcNail1 = serviceRepo.create({ name: 'کاشت ناخن پودری', description: 'کاشت پودر با بهترین مواد آمریکایی به همراه مانیکور روسی', price: 450000, durationMinutes: 90, category: savedNail, sortOrder: 1 });
  const svcNail2 = serviceRepo.create({ name: 'ژلیش ناخن طبیعی', description: 'لاک ژل ماندگار روی ناخن طبیعی دست با بیش از ۲۰۰ طیف رنگی', price: 250000, durationMinutes: 45, category: savedNail, sortOrder: 2 });
  const svcNail3 = serviceRepo.create({ name: 'پدیکور VIP', description: 'پدیکور درمانی، کفسابی، کوکتل‌تراپی، اسکراب و ماساژ پا', price: 500000, durationMinutes: 60, category: savedNail, sortOrder: 3 });

  const svcSkin1 = serviceRepo.create({ name: 'فیشیال کلاسیک', description: 'آبرسانی عمیق پوست، تخلیه جوش‌های سرسیاه و ماساژ ریلکسی پوست', price: 600000, durationMinutes: 60, category: savedSkin, sortOrder: 1 });
  const svcSkin2 = serviceRepo.create({ name: 'پاکسازی پوست VIP', description: 'جوانسازی، کربوکسی‌تراپی و لایه‌برداری تخصصی متناسب با نوع پوست', price: 950000, durationMinutes: 90, category: savedSkin, sortOrder: 2 });

  const svcMakeup1 = serviceRepo.create({ name: 'میکاپ مجلسی', description: 'کانتورینگ صورت و سایه چشم اسموکی یا خط چشمی مینی‌مال', price: 1500000, durationMinutes: 90, category: savedMakeup, sortOrder: 1 });
  const svcMakeup2 = serviceRepo.create({ name: 'پکیج کامل عروس', description: 'گریم سینمایی عروس، کانتورینگ، شینیون ژورنالی، طراحی ناخن و خدمات پوست', price: 12000000, durationMinutes: 240, category: savedMakeup, sortOrder: 2 });

  const savedServices = await serviceRepo.save([
    svcHair1, svcHair2, svcHair3,
    svcColor1, svcColor2,
    svcNail1, svcNail2, svcNail3,
    svcSkin1, svcSkin2,
    svcMakeup1, svcMakeup2
  ]);

  // 3. Create staff users
  const hash = await bcrypt.hash('Staff@1234', 10);
  const uParvane = userRepo.create({ fullName: 'پروانه اکبرپور', phone: '09111111111', password: hash, role: UserRole.STAFF, isActive: true, isVerified: true, email: 'parvane@parvane-salon.ir' });
  const uMahsa = userRepo.create({ fullName: 'مهسا رضایی', phone: '09222222222', password: hash, role: UserRole.STAFF, isActive: true, isVerified: true, email: 'mahsa@parvane-salon.ir' });
  const uZahra = userRepo.create({ fullName: 'زهرا حسینی', phone: '09333333333', password: hash, role: UserRole.STAFF, isActive: true, isVerified: true, email: 'zahra@parvane-salon.ir' });

  const savedUsers = await userRepo.save([uParvane, uMahsa, uZahra]);
  const [userP, userM, userZ] = savedUsers;

  // 4. Create Staff profiles linked to users and services
  const staff1 = staffRepo.create({
    fullName: 'پروانه اکبرپور',
    phone: '09111111111',
    email: 'parvane@parvane-salon.ir',
    bio: 'با ۱۵ سال سابقه درخشان در زمینه گریم و میکاپ عروس و شینیون‌های ژورنالی، مدیریت سالن پروانه',
    isActive: true,
    rating: 4.95,
    totalReviews: 48,
    experienceYears: 15,
    section: 'میکاپ و استایل',
    userId: userP.id,
    specialties: [savedServices[0], savedServices[1], savedServices[2], savedServices[10], savedServices[11]],
    permissions: ['manage_own_portfolio', 'respond_to_chat', 'view_own_appointments', 'manage_own_availability'] as any,
    workingHours: {
      saturday: { start: '09:00', end: '19:00', isOff: false },
      sunday: { start: '09:00', end: '19:00', isOff: false },
      monday: { start: '09:00', end: '19:00', isOff: false },
      tuesday: { start: '09:00', end: '19:00', isOff: false },
      wednesday: { start: '09:00', end: '19:00', isOff: false },
      thursday: { start: '09:00', end: '17:00', isOff: false },
      friday: { start: '09:00', end: '13:00', isOff: true }
    }
  });

  const staff2 = staffRepo.create({
    fullName: 'مهسا رضایی',
    phone: '09222222222',
    email: 'mahsa@parvane-salon.ir',
    bio: 'متخصص کاشت ناخن پودری و ژل، ژلیش و پدیکور درمانی با مدارک بین‌المللی',
    isActive: true,
    rating: 4.85,
    totalReviews: 32,
    experienceYears: 6,
    section: 'کاشت ناخن',
    userId: userM.id,
    specialties: [savedServices[5], savedServices[6], savedServices[7]],
    permissions: ['manage_own_portfolio', 'respond_to_chat', 'view_own_appointments', 'manage_own_availability'] as any,
    workingHours: {
      saturday: { start: '09:00', end: '19:00', isOff: false },
      sunday: { start: '09:00', end: '19:00', isOff: false },
      monday: { start: '09:00', end: '19:00', isOff: false },
      tuesday: { start: '09:00', end: '19:00', isOff: false },
      wednesday: { start: '09:00', end: '19:00', isOff: false },
      thursday: { start: '09:00', end: '17:00', isOff: false },
      friday: { start: '09:00', end: '13:00', isOff: true }
    }
  });

  const staff3 = staffRepo.create({
    fullName: 'زهرا حسینی',
    phone: '09333333333',
    email: 'zahra@parvane-salon.ir',
    bio: 'کارشناس رسمی پوست و فیشیال، ارائه فیشیال‌های تخصصی جوانسازی و رفع لک',
    isActive: true,
    rating: 4.90,
    totalReviews: 24,
    experienceYears: 8,
    section: 'پوست و فیشیال',
    userId: userZ.id,
    specialties: [savedServices[8], savedServices[9]],
    permissions: ['manage_own_portfolio', 'respond_to_chat', 'view_own_appointments', 'manage_own_availability'] as any,
    workingHours: {
      saturday: { start: '09:00', end: '19:00', isOff: false },
      sunday: { start: '09:00', end: '19:00', isOff: false },
      monday: { start: '09:00', end: '19:00', isOff: false },
      tuesday: { start: '09:00', end: '19:00', isOff: false },
      wednesday: { start: '09:00', end: '19:00', isOff: false },
      thursday: { start: '09:00', end: '17:00', isOff: false },
      friday: { start: '09:00', end: '13:00', isOff: true }
    }
  });

  await staffRepo.save([staff1, staff2, staff3]);

  // 5. Create StyleGallery items
  const gal1 = galleryRepo.create({
    title: 'میکاپ لایت عروس',
    description: 'میکاپ ملایم و اروپایی عروس همراه با سایه اسموکی لایت',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60',
    category: savedMakeup,
    tags: ['میکاپ', 'عروس', 'لایت'],
    viewsCount: 142,
    likesCount: 54,
    sortOrder: 1,
    isActive: true,
    staffName: 'پروانه اکبرپور',
    duration: '۴ ساعت'
  });

  const gal2 = galleryRepo.create({
    title: 'کاشت ناخن با طرح مینی‌مال',
    description: 'کاشت هلویی با دیزاین مینی‌مال خطی و نگین کریستالی',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=60',
    category: savedNail,
    tags: ['ناخن', 'کاشت', 'طراحی'],
    viewsCount: 98,
    likesCount: 42,
    sortOrder: 2,
    isActive: true,
    staffName: 'مهسا رضایی',
    duration: '۱.۵ ساعت'
  });

  const gal3 = galleryRepo.create({
    title: 'فیشیال VIP جوانسازی',
    description: 'نمونه کار پاکسازی و فیشیال حرفه‌ای آبرسانی پوست',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=60',
    category: savedSkin,
    tags: ['پوست', 'فیشیال', 'پاکسازی'],
    viewsCount: 88,
    likesCount: 31,
    sortOrder: 3,
    isActive: true,
    staffName: 'زهرا حسینی',
    duration: '۱.۵ ساعت'
  });

  await galleryRepo.save([gal1, gal2, gal3]);

  console.log('🌱 Seed completed successfully!');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await seedAdmin(app);
  await seedSalonData(app);

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
