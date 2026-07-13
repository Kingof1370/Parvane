import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable, OneToMany, OneToOne, JoinColumn,
} from 'typeorm';
import { SalonService } from '../../services/entities/service.entity';
import { StaffPortfolio } from './staff-portfolio.entity';

export enum StaffPermission {
  MANAGE_OWN_PORTFOLIO = 'manage_own_portfolio',
  RESPOND_TO_CHAT = 'respond_to_chat',
  VIEW_OWN_APPOINTMENTS = 'view_own_appointments',
  MANAGE_OWN_AVAILABILITY = 'manage_own_availability',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => SalonService, { eager: true })
  @JoinTable()
  specialties: SalonService[];

  @OneToMany(() => StaffPortfolio, (p) => p.staff, { cascade: true })
  portfolio: StaffPortfolio[];

  @Column({ type: 'jsonb', nullable: true })
  workingHours: {
    [day: string]: { start: string; end: string; isOff: boolean };
  };

  @Column({ default: 0, type: 'decimal', precision: 3, scale: 2 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: 0 })
  experienceYears: number;

  @Column({ nullable: true })
  instagramUrl: string;

  @Column({ nullable: true })
  certificationsText: string;

  @Column({ type: 'simple-array', nullable: true })
  permissions: StaffPermission[];

  // مرتبط با حساب کاربری برای ورود متخصص
  @Column({ nullable: true, unique: true })
  userId: string;

  @Column({ nullable: true })
  section: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
