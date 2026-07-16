import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum ChatRoomStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PENDING = 'pending',
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  client: User;

  @ManyToOne(() => Staff, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn()
  staff: Staff;

  @Column({ type: 'enum', enum: ChatRoomStatus, default: ChatRoomStatus.PENDING })
  status: ChatRoomStatus;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  serviceCategory: string;

  @Column({ default: 0 })
  unreadClientCount: number;

  @Column({ default: 0 })
  unreadStaffCount: number;

  @OneToMany(() => ChatMessage, (msg) => msg.room, { cascade: true })
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum ChatMessageSenderType {
  CLIENT = 'client',
  STAFF = 'staff',
  SYSTEM = 'system',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatRoom, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn()
  room: ChatRoom;

  @Column({ type: 'enum', enum: ChatMessageSenderType })
  senderType: ChatMessageSenderType;

  @Column({ nullable: true })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
