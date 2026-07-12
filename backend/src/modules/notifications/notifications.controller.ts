import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('اعلان‌ها')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'لیست اعلان‌های من' })
  findAll(@Request() req) { return this.svc.findByUser(req.user.id); }

  @Patch(':id/read')
  @ApiOperation({ summary: 'علامت خوانده‌شده' })
  markRead(@Param('id') id: string) { return this.svc.markRead(id); }

  @Patch('read-all')
  @ApiOperation({ summary: 'همه را خوانده‌شده کن' })
  markAllRead(@Request() req) { return this.svc.markAllRead(req.user.id); }
}
