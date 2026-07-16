import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { NotificationType } from './entities/notification.entity';
import { UsersService } from '../users/users.service';

@ApiTags('اعلان‌ها')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly svc: NotificationsService,
    private readonly usersSvc: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'لیست اعلان‌های من' })
  findAll(@Request() req) {
    return this.svc.findByUser(req.user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'تعداد اعلان‌های خوانده‌نشده' })
  getUnreadCount(@Request() req) {
    return this.svc.getUnreadCount(req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'همه را خوانده‌شده کن' })
  markAllRead(@Request() req) {
    return this.svc.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'علامت خوانده‌شده' })
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }

  // ادمین - ارسال اعلان به همه کاربران (مثل broadcast تلگرام)
  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ارسال اعلان عمومی به همه کاربران (ادمین)' })
  async broadcast(@Body() body: { title: string; message: string; type?: NotificationType }) {
    const allUsers = await this.usersSvc.findAll();
    const userIds = allUsers.map((u: any) => u.id);
    const fcmTokens = await this.usersSvc.getAllFcmTokens();
    return this.svc.broadcast(
      body.title,
      body.message,
      body.type || NotificationType.GENERAL,
      userIds,
      fcmTokens,
    );
  }

  // ادمین - ارسال اعلان خاص به یک کاربر
  @Post('send')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'ارسال اعلان به یک کاربر خاص (ادمین)' })
  async sendToUser(
    @Body() body: { userId: string; title: string; message: string; type?: NotificationType },
  ) {
    return this.svc.create(
      body.userId,
      body.title,
      body.message,
      body.type || NotificationType.GENERAL,
    );
  }
}
