import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Ride } from './ride.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ride_id' })
  rideId: number;

  @ManyToOne(() => Ride)
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @Column({ name: 'passenger_id' })
  passengerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @Column({ name: 'driver_id' })
  driverId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
