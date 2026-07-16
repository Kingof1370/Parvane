import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('سیستم امتیاز وفاداری')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly svc: LoyaltyService) {}

  @Get('my')
  @ApiOperation({ summary: 'امتیازات و تراکنش‌های من' })
  getMyPoints(@Request() req) {
    return this.svc.getUserPoints(req.user.id);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'استفاده از امتیاز' })
  redeem(@Request() req, @Body() body: { points: number; description: string }) {
    return this.svc.redeemPoints(req.user.id, body.points, body.description);
  }

  @Get('all-users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'لیست امتیاز همه مشتریان (ادمین)' })
  getAllUsers() {
    return this.svc.getAllUsersPoints();
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'تراکنش‌های کاربر خاص (ادمین)' })
  getUserTransactions(@Param('userId') userId: string) {
    return this.svc.getUserTransactions(userId);
  }

  @Post('admin/adjust/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'تعدیل امتیاز کاربر توسط ادمین' })
  adminAdjust(
    @Param('userId') userId: string,
    @Request() req,
    @Body() body: { points: number; description: string },
  ) {
    return this.svc.adminAdjust(userId, body.points, body.description, req.user.id);
  }
}
