import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('خدمات')
@Controller('services')
export class ServicesController {
  constructor(private readonly svc: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'لیست همه خدمات' })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.svc.findAll(categoryId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'لیست دسته‌بندی‌ها' })
  getCategories() {
    return this.svc.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات یک خدمت' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن خدمت جدید (ادمین)' })
  create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش خدمت (ادمین)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف خدمت (ادمین)' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  createCategory(@Body() dto: any) {
    return this.svc.createCategory(dto);
  }
}
