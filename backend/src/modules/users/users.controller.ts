import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
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

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'لیست کاربران (ادمین)' })
  findAll(@Query('search') search?: string) {
    return this.svc.findAll(search);
  }

  @Put(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'فعال/غیرفعال کردن کاربر (ادمین)' })
  toggleActive(@Param('id') id: string) {
    return this.svc.toggleActive(id);
  }
}
