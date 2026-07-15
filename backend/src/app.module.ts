import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { StaffModule } from './modules/staff/staff.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ChatModule } from './modules/chat/chat.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          ...(dbUrl
            ? { url: dbUrl }
            : {
                host: config.get<string>('DATABASE_HOST', 'localhost'),
                port: Number(config.get<number>('DATABASE_PORT', 5432)),
                username: config.get<string>('DATABASE_USER', 'postgres'),
                password: config.get<string>('DATABASE_PASSWORD', 'password'),
                database: config.get<string>('DATABASE_NAME', 'parvane_salon'),
              }),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get<string>('DATABASE_SYNCHRONIZE', 'true') === 'true',
          logging: config.get<string>('NODE_ENV') === 'development',
          ssl:
            config.get<string>('DATABASE_SSL', 'true') === 'true' || !!dbUrl
              ? { rejectUnauthorized: false }
              : false,
        } as any;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ServicesModule,
    AppointmentsModule,
    StaffModule,
    NotificationsModule,
    PaymentsModule,
    SettingsModule,
    UploadModule,
    DashboardModule,
    GalleryModule,
    LoyaltyModule,
    ChatModule,
  ],
})
export class AppModule {}
