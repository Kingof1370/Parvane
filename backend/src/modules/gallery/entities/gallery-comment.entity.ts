import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, RelationId,
} from 'typeorm';
import { StyleGallery } from './style-gallery.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('gallery_comments')
export class GalleryComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StyleGallery, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'gallery_id' })
  gallery: StyleGallery;

  @RelationId((c: GalleryComment) => c.gallery)
  galleryId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((c: GalleryComment) => c.user)
  userId: string;

  // نام نمایشی (برای مهمان‌ها)
  @Column({ nullable: true, length: 100 })
  guestName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
