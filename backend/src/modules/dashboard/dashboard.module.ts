import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { User } from '../auth/entities/user.entity';
import { SalonService } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, SalonService])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
