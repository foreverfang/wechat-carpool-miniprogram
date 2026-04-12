import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({
    type: 'enum',
    enum: ['suggestion', 'bug', 'other'],
    default: 'other',
  })
  type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'contact_info', nullable: true, length: 100 })
  contactInfo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
