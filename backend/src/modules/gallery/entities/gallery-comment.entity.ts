import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { StyleGallery } from './style-gallery.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('gallery_comments')
export class GalleryComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StyleGallery, { onDelete: 'CASCADE' })
  @JoinColumn()
  gallery: StyleGallery;

  @Column()
  galleryId: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  // نام نمایشی (برای مهمان‌ها)
  @Column({ nullable: true })
  guestName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
