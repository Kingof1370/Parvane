import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Staff } from './staff.entity';

export enum PortfolioItemType {
  BEFORE_AFTER = 'before_after',
  WORK_SAMPLE = 'work_sample',
  CERTIFICATE = 'certificate',
  VIDEO = 'video',
}

@Entity('staff_portfolio')
export class StaffPortfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn()
  staff: Staff;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  beforeImageUrl: string;

  @Column({ type: 'enum', enum: PortfolioItemType, default: PortfolioItemType.WORK_SAMPLE })
  type: PortfolioItemType;

  @Column({ nullable: true })
  serviceCategory: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: 0 })
  likesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
