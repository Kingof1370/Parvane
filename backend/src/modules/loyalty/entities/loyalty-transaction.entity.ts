import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum LoyaltyTransactionType {
  EARNED_APPOINTMENT = 'earned_appointment',
  EARNED_REVIEW = 'earned_review',
  EARNED_REFERRAL = 'earned_referral',
  REDEEMED_DISCOUNT = 'redeemed_discount',
  REDEEMED_FREE_SERVICE = 'redeemed_free_service',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  EXPIRED = 'expired',
}

@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  appointment: Appointment;

  @Column({ type: 'enum', enum: LoyaltyTransactionType })
  type: LoyaltyTransactionType;

  @Column({ type: 'int' })
  points: number;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
