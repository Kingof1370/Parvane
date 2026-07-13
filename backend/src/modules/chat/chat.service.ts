import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom, ChatMessage, ChatRoomStatus, ChatMessageSenderType } from './entities/chat-room.entity';
import { UserRole } from '../auth/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom) private roomRepo: Repository<ChatRoom>,
    @InjectRepository(ChatMessage) private msgRepo: Repository<ChatMessage>,
  ) {}

  async createRoom(clientId: string, dto: { subject?: string; serviceCategory?: string; staffId?: string }) {
    const room = this.roomRepo.create({
      client: { id: clientId },
      staff: dto.staffId ? { id: dto.staffId } : undefined,
      subject: dto.subject,
      serviceCategory: dto.serviceCategory,
      status: ChatRoomStatus.PENDING,
    });
    return this.roomRepo.save(room);
  }

  async getClientRooms(clientId: string) {
    return this.roomRepo.find({
      where: { client: { id: clientId } },
      relations: ['staff'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getStaffRooms(staffId: string) {
    return this.roomRepo.find({
      where: [
        { staff: { id: staffId } },
        { status: ChatRoomStatus.PENDING, staff: null as any },
      ],
      relations: ['client', 'staff'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getAdminRooms() {
    return this.roomRepo.find({
      relations: ['client', 'staff'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getRoomMessages(roomId: string, userId: string, userRole: UserRole) {
    const room = await this.roomRepo.findOne({
      where: { id: roomId },
      relations: ['client', 'staff'],
    });
    if (!room) throw new NotFoundException('اتاق گفتگو یافت نشد');
    if (
      userRole !== UserRole.ADMIN &&
      room.client.id !== userId &&
      room.staff?.userId !== userId
    ) {
      throw new ForbiddenException('دسترسی ندارید');
    }
    const messages = await this.msgRepo.find({
      where: { room: { id: roomId } },
      order: { createdAt: 'ASC' },
    });
    // Mark messages as read for this user
    if (room.client.id === userId) {
      await this.roomRepo.update(roomId, { unreadClientCount: 0 });
    } else {
      await this.roomRepo.update(roomId, { unreadStaffCount: 0 });
    }
    return { room, messages };
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    senderType: ChatMessageSenderType,
    content: string,
    imageUrl?: string,
  ) {
    const room = await this.roomRepo.findOne({ where: { id: roomId }, relations: ['client', 'staff'] });
    if (!room) throw new NotFoundException('اتاق گفتگو یافت نشد');
    const msg = this.msgRepo.create({ room: { id: roomId }, senderType, senderId, content, imageUrl });
    await this.msgRepo.save(msg);
    if (senderType === ChatMessageSenderType.CLIENT) {
      await this.roomRepo.increment({ id: roomId }, 'unreadStaffCount', 1);
    } else {
      await this.roomRepo.increment({ id: roomId }, 'unreadClientCount', 1);
    }
    await this.roomRepo.update(roomId, { updatedAt: new Date() as any });
    return msg;
  }

  async assignStaff(roomId: string, staffId: string) {
    await this.roomRepo.update(roomId, {
      staff: { id: staffId },
      status: ChatRoomStatus.OPEN,
    });
    return { message: 'متخصص به اتاق گفتگو اختصاص یافت' };
  }

  async closeRoom(roomId: string) {
    await this.roomRepo.update(roomId, { status: ChatRoomStatus.CLOSED });
    return { message: 'گفتگو بسته شد' };
  }
}
