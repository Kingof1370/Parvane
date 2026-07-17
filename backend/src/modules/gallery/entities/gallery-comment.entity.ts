import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { StyleGallery } from './style-gallery.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('gallery_comments')
export class GalleryComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StyleGallery, { onDelete: 'CASCADE' })
  gallery: StyleGallery;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  /** نام نمایشی برای کامنت مهمان */
  @Column({ nullable: true, length: 100 })
  guestName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
