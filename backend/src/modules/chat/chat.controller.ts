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

  @Post('rooms')
  @ApiOperation({ summary: 'ایجاد اتاق گفتگو (مشتری)' })
  createRoom(@Request() req, @Body() dto: { subject?: string; serviceCategory?: string; staffId?: string }) {
    return this.svc.createRoom(req.user.id, dto);
  }

  @Get('rooms/my')
  @ApiOperation({ summary: 'اتاق‌های گفتگوی من (مشتری)' })
  getMyRooms(@Request() req) {
    return this.svc.getClientRooms(req.user.id);
  }

  @Get('rooms/staff')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'اتاق‌های گفتگو برای متخصص' })
  getStaffRooms(@Request() req) {
    return this.svc.getStaffRooms(req.user.id);
  }

  @Get('rooms/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'همه اتاق‌های گفتگو (ادمین)' })
  getAllRooms() {
    return this.svc.getAdminRooms();
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'پیام‌های یک اتاق گفتگو' })
  getMessages(@Param('roomId') roomId: string, @Request() req) {
    return this.svc.getRoomMessages(roomId, req.user.id, req.user.role);
  }

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

  @Patch('rooms/:roomId/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'اختصاص متخصص به اتاق گفتگو' })
  assignStaff(@Param('roomId') roomId: string, @Body() body: { staffId: string }) {
    return this.svc.assignStaff(roomId, body.staffId);
  }

  @Patch('rooms/:roomId/close')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'بستن اتاق گفتگو' })
  closeRoom(@Param('roomId') roomId: string) {
    return this.svc.closeRoom(roomId);
  }
}
