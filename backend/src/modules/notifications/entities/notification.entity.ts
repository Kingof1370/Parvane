import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationType {
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  AFTERCARE_REMINDER = 'aftercare_reminder',
  LOYALTY_REWARD = 'loyalty_reward',
  LOYALTY_EXPIRY = 'loyalty_expiry',
  PRE_PAYMENT_REQUIRED = 'pre_payment_required',
  PRE_PAYMENT_CONFIRMED = 'pre_payment_confirmed',
  CHAT_NEW_MESSAGE = 'chat_new_message',
  REVIEW_REQUEST = 'review_request',
  PROMOTION = 'promotion',
  GENERAL = 'general',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.GENERAL })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  data: any;

  @Column({ nullable: true })
  scheduledAt: Date;

  @Column({ default: false })
  isSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
