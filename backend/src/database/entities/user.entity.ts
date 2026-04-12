import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  openid: string;

  @Column({ nullable: true, length: 100 })
  unionid: string;

  @Column({ length: 100, default: '' })
  nickname: string;

  @Column({ length: 500, default: '' })
  avatar: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ name: 'im_user_id', nullable: true, length: 100 })
  imUserId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: ['active', 'disabled'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'notify_ride_match', default: true })
  notifyRideMatch: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
