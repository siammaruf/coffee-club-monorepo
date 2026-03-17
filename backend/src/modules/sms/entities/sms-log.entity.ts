import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { SmsLogStatus } from '../enum/sms-log-status.enum';

@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: SmsLogStatus, default: SmsLogStatus.SENT })
  status: SmsLogStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  created_at: Date;
}
