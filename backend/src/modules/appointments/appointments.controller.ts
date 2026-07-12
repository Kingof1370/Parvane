import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('رزروها')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'ثبت رزرو جدید' })
  create(@Request() req, @Body() dto: any) {
    return this.svc.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'رزروهای من' })
  myAppointments(@Request() req, @Query('status') status?: string) {
    return this.svc.findByClient(req.user.id, status);
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'زمان‌های خالی برای رزرو' })
  getSlots(@Query('staffId') staffId: string, @Query('serviceId') serviceId: string, @Query('date') date: string) {
    return this.svc.getAvailableSlots(staffId, serviceId, date);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'همه رزروها (ادمین/کارمند)' })
  findAll(@Query('date') date?: string, @Query('staffId') staffId?: string, @Query('status') status?: string) {
    return this.svc.findAll({ date, staffId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'تغییر وضعیت رزرو' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string; reason?: string }) {
    return this.svc.updateStatus(id, body.status, body.reason);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'لغو رزرو توسط مشتری' })
  cancel(@Param('id') id: string, @Request() req, @Body() body: { reason?: string }) {
    return this.svc.cancelByClient(id, req.user.id, body.reason);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'ثبت نظر و امتیاز' })
  review(@Param('id') id: string, @Request() req, @Body() body: { rating: number; text?: string }) {
    return this.svc.addReview(id, req.user.id, body.rating, body.text);
  }
}
