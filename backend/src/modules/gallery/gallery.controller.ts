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

  @Get()
  @ApiOperation({ summary: 'لیست گالری استایل‌ها' })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.svc.findAll(categoryId, tag, search);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست کامل گالری برای مدیر و متخصصان' })
  findAllAdmin(@Request() req) {
    return this.svc.findAllAdmin(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات آیتم گالری' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن آیتم به گالری' })
  create(@Body() dto: any, @Request() req) {
    return this.svc.create(dto, req.user.id, req.user.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش آیتم گالری' })
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.svc.update(id, dto, req.user.id, req.user.role);
  }

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
