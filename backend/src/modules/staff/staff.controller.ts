import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('کارکنان')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'لیست متخصصان' })
  findAll() { return this.staffService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'پروفایل کامل متخصص (با پورتفولیو)' })
  findOne(@Param('id') id: string) { return this.staffService.findOne(id); }

  @Get(':id/availability')
  @ApiOperation({ summary: 'زمان‌های خالی متخصص' })
  getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.staffService.getAvailability(id, date);
  }

  @Get(':id/portfolio')
  @ApiOperation({ summary: 'نمونه‌کارهای متخصص (عمومی)' })
  getPortfolio(@Param('id') id: string) {
    return this.staffService.getPortfolio(id);
  }

  @Get(':id/portfolio/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'نمونه‌کارهای متخصص برای مدیر' })
  getPortfolioAdmin(@Param('id') id: string) {
    return this.staffService.getPortfolioAdmin(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  create(@Body() dto: any) { return this.staffService.create(dto); }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: any) {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.staffService.remove(id); }

  // --- مدیریت پورتفولیو ---

  @Post(':id/portfolio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن نمونه‌کار به پروفایل متخصص' })
  addPortfolioItem(@Param('id') staffId: string, @Body() dto: any, @Request() req) {
    return this.staffService.addPortfolioItem(staffId, dto, req.user.id, req.user.role);
  }

  @Put('portfolio/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش آیتم پورتفولیو' })
  updatePortfolioItem(@Param('itemId') itemId: string, @Body() dto: any, @Request() req) {
    return this.staffService.updatePortfolioItem(itemId, dto, req.user.id, req.user.role);
  }

  @Delete('portfolio/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف آیتم پورتفولیو' })
  removePortfolioItem(@Param('itemId') itemId: string, @Request() req) {
    return this.staffService.removePortfolioItem(itemId, req.user.id, req.user.role);
  }

  // --- مدیریت دسترسی متخصص ---

  @Patch(':id/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تنظیم سطح دسترسی متخصص (ادمین)' })
  updatePermissions(@Param('id') staffId: string, @Body() body: { permissions: string[] }) {
    return this.staffService.updatePermissions(staffId, body.permissions);
  }

  @Patch(':id/link-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لینک کردن حساب کاربری به متخصص (ادمین)' })
  linkUserAccount(@Param('id') staffId: string, @Body() body: { userId: string }) {
    return this.staffService.linkUserAccount(staffId, body.userId);
  }
}
