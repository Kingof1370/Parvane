import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { ServiceCategory } from '../../services/entities/service.entity';

export enum GalleryItemStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('style_gallery')
export class StyleGallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: GalleryItemStatus, default: GalleryItemStatus.ACTIVE })
  status: GalleryItemStatus;

  @ManyToOne(() => ServiceCategory, { nullable: true, eager: true })
  @JoinColumn()
  category: ServiceCategory;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  staffName: string;

  @Column({ nullable: true })
  duration: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
