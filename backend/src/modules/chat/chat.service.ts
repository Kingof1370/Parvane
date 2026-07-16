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
    // اگر قبلاً اتاق باز داشت، همون رو برگردون
    const existing = await this.roomRepo.findOne({
      where: {
        client: { id: clientId },
        status: ChatRoomStatus.OPEN,
        ...(dto.staffId ? { staff: { id: dto.staffId } } : {}),
      },
      relations: ['staff'],
    });
    if (existing) return existing;

    const room = this.roomRepo.create({
      client: { id: clientId },
      staff: dto.staffId ? { id: dto.staffId } : undefined,
      subject: dto.subject,
      serviceCategory: dto.serviceCategory,
      status: dto.staffId ? ChatRoomStatus.OPEN : ChatRoomStatus.PENDING,
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

  async getStaffRooms(staffUserId: string) {
    return this.roomRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.client', 'client')
      .leftJoinAndSelect('r.staff', 'staff')
      .where('staff.userId = :staffUserId', { staffUserId })
      .orWhere('r.status = :pending', { pending: ChatRoomStatus.PENDING })
      .orderBy('r.updatedAt', 'DESC')
      .getMany();
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
      room.client?.id !== userId &&
      room.staff?.userId !== userId
    ) {
      throw new ForbiddenException('دسترسی ندارید');
    }
    const messages = await this.msgRepo.find({
      where: { room: { id: roomId } },
      order: { createdAt: 'ASC' },
    });
    // خوانده شده نشان بده
    if (room.client?.id === userId) {
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

    // اگر اتاق PENDING بود و متخصص پیام داد، OPEN بشه
    if (room.status === ChatRoomStatus.PENDING && senderType !== ChatMessageSenderType.CLIENT) {
      await this.roomRepo.update(roomId, { status: ChatRoomStatus.OPEN });
    }

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

  async getTotalUnread(userId: string, userRole: UserRole) {
    if (userRole === UserRole.CLIENT) {
      const rooms = await this.roomRepo.find({
        where: { client: { id: userId } },
        select: ['unreadClientCount'],
      });
      return { count: rooms.reduce((s, r) => s + r.unreadClientCount, 0) };
    } else {
      // متخصص یا ادمین
      const rooms = await this.roomRepo.find({
        where: userRole === UserRole.ADMIN ? {} : { staff: { userId } as any },
        select: ['unreadStaffCount'],
      });
      return { count: rooms.reduce((s, r) => s + r.unreadStaffCount, 0) };
    }
  }
}
