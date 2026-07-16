import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { SalonService, ServiceCategory } from './entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalonService, ServiceCategory])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
