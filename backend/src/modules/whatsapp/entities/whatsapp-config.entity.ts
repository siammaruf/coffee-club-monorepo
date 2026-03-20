import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('whatsapp_config')
export class WhatsAppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: true })
  order_notifications_enabled: boolean;

  @Column({ default: true })
  daily_report_enabled: boolean;

  @Column({ type: 'varchar', default: '23:00' })
  daily_report_time: string;

  @Column({ default: false })
  otp_via_whatsapp: boolean;

  @Column({ type: 'text', nullable: true })
  order_notification_template: string | null;

  @Column({ type: 'text', nullable: true })
  daily_report_template: string | null;

  @UpdateDateColumn()
  updated_at: Date;
}
