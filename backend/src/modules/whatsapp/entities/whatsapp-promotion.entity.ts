import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { PromotionStatus, PromotionTarget } from '../enums';

@Entity('whatsapp_promotions')
export class WhatsAppPromotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: PromotionTarget, default: PromotionTarget.ALL })
  target: PromotionTarget;

  @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.DRAFT })
  status: PromotionStatus;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date | null;

  @Column({ type: 'int', default: 0 })
  total_recipients: number;

  @Column({ type: 'int', default: 0 })
  successful_count: number;

  @Column({ type: 'int', default: 0 })
  failed_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
