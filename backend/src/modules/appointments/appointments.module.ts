import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { StaffModule } from '../staff/staff.module';
import { ServicesModule } from '../services/services.module';
import { LoyaltyTransaction } from '../loyalty/entities/loyalty-transaction.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, LoyaltyTransaction, User]),
    StaffModule,
    ServicesModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
