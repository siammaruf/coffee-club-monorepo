import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ContactType } from '../enums';

@Entity('whatsapp_contacts')
export class WhatsAppContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: 'enum', enum: ContactType, default: ContactType.INDIVIDUAL })
  type: ContactType;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  receive_order_notifications: boolean;

  @Column({ default: false })
  receive_daily_reports: boolean;

  @DeleteDateColumn()
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
