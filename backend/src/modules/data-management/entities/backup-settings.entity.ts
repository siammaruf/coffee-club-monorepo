import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('backup_settings')
export class BackupSettings {
  @ApiProperty({
    description: 'Unique identifier for the backup settings record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Whether automatic backups are enabled',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  auto_backup_enabled: boolean;

  @ApiProperty({
    description: 'Schedule type for automatic backups',
    example: 'daily',
    default: 'daily',
    enum: ['daily', 'weekly', 'disabled'],
  })
  @Column({ default: 'daily' })
  schedule_type: string;

  @ApiProperty({
    description: 'Cron expression for the backup schedule',
    example: '0 0 * * *',
    default: '0 0 * * *',
  })
  @Column({ default: '0 0 * * *' })
  cron_expression: string;

  @ApiProperty({
    description: 'Number of days to retain backups',
    example: 7,
    default: 7,
  })
  @Column({ type: 'int', default: 7 })
  retention_days: number;

  @ApiProperty({
    description: 'Maximum number of backups to keep',
    example: 10,
    default: 10,
  })
  @Column({ type: 'int', default: 10 })
  max_backups: number;

  @ApiProperty({
    description: 'Google Drive service account email for backup uploads',
    nullable: true,
  })
  @Column({ nullable: true })
  google_drive_service_account_email: string;

  @ApiProperty({
    description: 'Google Drive service account private key (encrypted at rest)',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  google_drive_private_key: string;

  @ApiProperty({
    description: 'Google Drive folder ID where backups are stored',
    nullable: true,
  })
  @Column({ nullable: true })
  google_drive_folder_id: string;

  @ApiProperty({
    description: 'Date when the settings were last updated',
    example: '2024-01-15T12:00:00Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
