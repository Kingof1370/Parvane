import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CLIENT = 'client',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  otpExpiry: Date;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  // سیستم امتیازدهی وفاداری
  @Column({ default: 0 })
  loyaltyPoints: number;

  @Column({ default: 0 })
  totalLoyaltyEarned: number;

  @Column({ default: 0 })
  totalLoyaltyRedeemed: number;

  // برای متخصصان: بخش مرتبط
  @Column({ nullable: true })
  staffSection: string;

  @OneToMany(() => Appointment, (appt) => appt.client)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
