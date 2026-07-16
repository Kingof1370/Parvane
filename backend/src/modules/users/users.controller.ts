import { Controller, Get, Put, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('کاربران')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Put('profile')
  @ApiOperation({ summary: 'ویرایش پروفایل' })
  updateProfile(@Request() req, @Body() dto: any) {
    return this.svc.updateProfile(req.user.id, dto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'تغییر رمز عبور توسط کاربر' })
  changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.svc.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  // ادمین - لیست همه کاربران
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'لیست همه کاربران (ادمین)' })
  findAll(@Query('search') search?: string) {
    return this.svc.findAll(search);
  }

  // ادمین - لیست مشتریان
  @Get('clients')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'لیست مشتریان (ادمین)' })
  findClients(@Query('search') search?: string) {
    return this.svc.findClients(search);
  }

  // ادمین - لیست متخصصان و ادمین‌ها
  @Get('staff')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'لیست متخصصان/ادمین‌ها' })
  findStaff() {
    return this.svc.findStaffUsers();
  }

  // ادمین - ایجاد حساب متخصص
  @Post('staff')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ساخت حساب متخصص (ادمین)' })
  createStaff(@Body() dto: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    staffSection?: string;
  }) {
    return this.svc.createStaffUser(dto);
  }

  // ادمین - تغییر نقش کاربر (مثل ادمین تلگرام)
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'تغییر نقش کاربر - admin/staff/client (ادمین)' })
  changeRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole; staffSection?: string },
  ) {
    return this.svc.changeRole(id, body.role, body.staffSection);
  }

  // ادمین - تغییر رمز عبور کاربر
  @Patch(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ریست رمز عبور کاربر (ادمین)' })
  resetPassword(@Param('id') id: string, @Body() body: { newPassword: string }) {
    return this.svc.resetPassword(id, body.newPassword);
  }

  // ادمین - فعال/غیرفعال کردن کاربر
  @Put(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'فعال/غیرفعال کردن کاربر (ادمین)' })
  toggleActive(@Param('id') id: string) {
    return this.svc.toggleActive(id);
  }

  // ادمین - مشاهده پروفایل هر کاربر
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'پروفایل کاربر (ادمین)' })
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }
}
