import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { SalonService } from '../../services/entities/service.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, u => u.appointments, { eager: true })
  @JoinColumn()
  client: User;

  @ManyToOne(() => SalonService, { eager: true })
  @JoinColumn()
  service: SalonService;

  @ManyToOne(() => Staff, { eager: true })
  @JoinColumn()
  staff: Staff;

  @Column({ type: 'date' })
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  adminNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  paidAmount: number;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ nullable: true })
  reviewRating: number;

  @Column({ nullable: true, type: 'text' })
  reviewText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
