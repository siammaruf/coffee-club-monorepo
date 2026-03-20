import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageStatus } from '../enums';
import { WhatsAppPromotion } from './whatsapp-promotion.entity';

@Entity('whatsapp_messages')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient: string;

  @Column({ type: 'varchar', nullable: true })
  recipient_name: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.PENDING })
  status: MessageStatus;

  @Column({ type: 'varchar', nullable: true })
  message_type: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'varchar', nullable: true })
  whatsapp_message_id: string | null;

  @ManyToOne(() => WhatsAppPromotion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promotion_id' })
  promotion: WhatsAppPromotion | null;

  @Column({ type: 'uuid', nullable: true })
  promotion_id: string | null;

  @CreateDateColumn()
  created_at: Date;
}
