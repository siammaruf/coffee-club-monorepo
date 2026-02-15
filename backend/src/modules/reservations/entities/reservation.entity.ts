import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { EventType } from '../enum/event-type.enum';
import { ReservationStatus } from '../enum/reservation-status.enum';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  customer_id: string | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  time: string;

  @Column({ type: 'int', default: 2 })
  party_size: number;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.DINING,
  })
  event_type: EventType;

  @Column({ type: 'text', nullable: true })
  special_requests: string | null;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
