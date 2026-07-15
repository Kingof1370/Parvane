import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ChatMessageSenderType } from './entities/chat-room.entity';

@ApiTags('مشاوره آنلاین')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly svc: ChatService) {}

  // مشتری - ایجاد اتاق مشاوره
  @Post('rooms')
  @ApiOperation({ summary: 'ایجاد اتاق مشاوره جدید (مشتری)' })
  createRoom(
    @Request() req,
    @Body() body: { subject?: string; serviceCategory?: string; staffId?: string },
  ) {
    return this.svc.createRoom(req.user.id, body);
  }

  // مشتری - اتاق‌های خودم
  @Get('rooms/my')
  @ApiOperation({ summary: 'اتاق‌های مشاوره من (مشتری)' })
  getMyRooms(@Request() req) {
    if (req.user.role === UserRole.CLIENT) {
      return this.svc.getClientRooms(req.user.id);
    }
    return this.svc.getStaffRooms(req.user.id);
  }

  // متخصص - اتاق‌های مرتبط
  @Get('rooms/staff')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'اتاق‌های گفتگو برای متخصص' })
  getStaffRooms(@Request() req) {
    return this.svc.getStaffRooms(req.user.id);
  }

  // ادمین - همه اتاق‌ها
  @Get('rooms/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'همه اتاق‌های گفتگو (ادمین)' })
  getAllRooms() {
    return this.svc.getAdminRooms();
  }

  // تعداد پیام‌های خوانده‌نشده
  @Get('unread-count')
  @ApiOperation({ summary: 'تعداد پیام‌های خوانده‌نشده' })
  getUnreadCount(@Request() req) {
    return this.svc.getTotalUnread(req.user.id, req.user.role);
  }

  // پیام‌های یک اتاق
  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'پیام‌های یک اتاق گفتگو' })
  getMessages(@Param('roomId') roomId: string, @Request() req) {
    return this.svc.getRoomMessages(roomId, req.user.id, req.user.role);
  }

  // ارسال پیام
  @Post('rooms/:roomId/messages')
  @ApiOperation({ summary: 'ارسال پیام' })
  sendMessage(
    @Param('roomId') roomId: string,
    @Request() req,
    @Body() body: { content: string; imageUrl?: string },
  ) {
    const senderType =
      req.user.role === UserRole.CLIENT
        ? ChatMessageSenderType.CLIENT
        : ChatMessageSenderType.STAFF;
    return this.svc.sendMessage(roomId, req.user.id, senderType, body.content, body.imageUrl);
  }

  // ادمین/متخصص - اختصاص متخصص به اتاق
  @Patch('rooms/:roomId/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'اختصاص متخصص به اتاق گفتگو' })
  assignStaff(@Param('roomId') roomId: string, @Body() body: { staffId: string }) {
    return this.svc.assignStaff(roomId, body.staffId);
  }

  // بستن اتاق
  @Patch('rooms/:roomId/close')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'بستن اتاق گفتگو' })
  closeRoom(@Param('roomId') roomId: string) {
    return this.svc.closeRoom(roomId);
  }
}
