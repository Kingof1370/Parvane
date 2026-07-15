import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('داشبورد مدیریت')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'خلاصه آمار سالن' })
  getSummary() {
    return this.svc.getSummary();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'درآمد بر اساس بازه زمانی' })
  getRevenue(@Query('from') from: string, @Query('to') to: string) {
    return this.svc.getRevenue(from, to);
  }

  @Get('popular-services')
  @ApiOperation({ summary: 'خدمات پرطرفدار' })
  getPopularServices() {
    return this.svc.getPopularServices();
  }

  @Get('appointments-chart')
  @ApiOperation({ summary: 'نمودار رزروها' })
  getChart(@Query('days') days: string) {
    return this.svc.getAppointmentsChart(Number(days) || 30);
  }

  @Get('clients-stats')
  @ApiOperation({ summary: 'آمار مشتریان' })
  getClientsStats() {
    return this.svc.getClientsStats();
  }

  @Get('recent-appointments')
  @ApiOperation({ summary: 'آخرین رزروها' })
  getRecentAppointments(@Query('limit') limit: string) {
    return this.svc.getRecentAppointments(Number(limit) || 10);
  }
}
