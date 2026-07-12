import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { SalonService } from '../../services/entities/service.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
