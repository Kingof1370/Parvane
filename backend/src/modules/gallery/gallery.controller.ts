import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('گالری استایل‌ها')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly svc: GalleryService) {}

  // عمومی - لیست گالری (بدون احراز هویت)
  @Get()
  @ApiOperation({ summary: 'لیست گالری استایل‌ها' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll(categoryId, tag, search);
  }

  // ادمین - لیست کامل گالری
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست کامل گالری برای مدیر' })
  findAllAdmin() {
    return this.svc.findAllAdmin();
  }

  // متخصص - آیتم‌های گالری خودش
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'آیتم‌های گالری من (متخصص)' })
  findMine(@Request() req) {
    return this.svc.findByStaff(req.user.fullName || '', req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات آیتم گالری' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // ادمین - ایجاد آیتم گالری برای هر متخصص
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن آیتم به گالری (ادمین)' })
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  // متخصص - ایجاد آیتم گالری برای خودش
  @Post('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن آیتم به گالری من (متخصص)' })
  createMine(@Request() req, @Body() dto: any) {
    const staffName = req.user.fullName || '';
    return this.svc.createByStaff(dto, staffName, req.user.id);
  }

  // ویرایش آیتم - ادمین همه / متخصص فقط مال خودش
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش آیتم گالری' })
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.svc.update(id, dto, req.user.id, req.user.role);
  }

  // حذف آیتم - ادمین همه / متخصص فقط مال خودش
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف آیتم گالری' })
  remove(@Param('id') id: string, @Request() req) {
    return this.svc.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'پسند کردن آیتم گالری' })
  like(@Param('id') id: string) {
    return this.svc.like(id);
  }
}
