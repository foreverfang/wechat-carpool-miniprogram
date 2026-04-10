import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['find-car', 'find-passenger'],
  })
  type: string;

  @Column({ length: 200 })
  departure: string;

  @Column({ name: 'departure_location', type: 'json', nullable: true })
  departureLocation: { latitude: number; longitude: number };

  @Column({ length: 200 })
  destination: string;

  @Column({ name: 'destination_location', type: 'json', nullable: true })
  destinationLocation: { latitude: number; longitude: number };

  @Column({ type: 'json', nullable: true })
  waypoints: Array<{ latitude: number; longitude: number }>;

  @Column({ name: 'departure_time', type: 'datetime' })
  departureTime: Date;

  @Column({ nullable: true, type: 'int' })
  seats: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({
    type: 'enum',
    enum: ['active', 'closed', 'expired'],
    default: 'active',
  })
  status: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
