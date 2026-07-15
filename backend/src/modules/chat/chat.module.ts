import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom, ChatMessage } from './entities/chat-room.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatMessage, Staff])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
