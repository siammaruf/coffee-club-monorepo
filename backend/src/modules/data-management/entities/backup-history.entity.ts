import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { BackupType } from '../enums/backup-type.enum';
import { BackupStatus } from '../enums/backup-status.enum';

@Entity('backup_history')
export class BackupHistory {
  @ApiProperty({
    description: 'Unique identifier for the backup record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the backup file',
    example: 'backup_2024-01-15_120000.json',
  })
  @Column({ nullable: false })
  filename: string;

  @ApiProperty({
    description: 'Google Drive file ID if uploaded to Drive',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
    nullable: true,
  })
  @Column({ nullable: true })
  google_drive_file_id: string;

  @ApiProperty({
    description: 'Size of the backup file in bytes',
    example: 1048576,
    default: 0,
  })
  @Column({ type: 'bigint', default: 0 })
  file_size: number;

  @ApiProperty({
    description: 'Total number of records in the backup',
    example: 1500,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  total_records: number;

  @ApiProperty({
    description: 'Record count per entity type',
    example: { users: 10, orders: 500, items: 50 },
    nullable: true,
  })
  @Column({ type: 'json', nullable: true })
  entity_counts: Record<string, number>;

  @ApiProperty({
    description: 'Version of the backup format',
    example: '1.0.0',
    default: '1.0.0',
  })
  @Column({ default: '1.0.0' })
  version: string;

  @ApiProperty({
    description: 'Type of backup (manual or scheduled)',
    enum: BackupType,
    example: BackupType.MANUAL,
    default: BackupType.MANUAL,
  })
  @Column({
    type: 'enum',
    enum: BackupType,
    default: BackupType.MANUAL,
  })
  type: BackupType;

  @ApiProperty({
    description: 'Current status of the backup',
    enum: BackupStatus,
    example: BackupStatus.IN_PROGRESS,
    default: BackupStatus.IN_PROGRESS,
  })
  @Column({
    type: 'enum',
    enum: BackupStatus,
    default: BackupStatus.IN_PROGRESS,
  })
  status: BackupStatus;

  @ApiProperty({
    description: 'Error message if the backup failed',
    nullable: true,
  })
  @Column({ nullable: true })
  error_message: string;

  @ApiProperty({
    description: 'User who created the backup',
    type: () => User,
    nullable: true,
  })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @ApiProperty({
    description: 'Date when the backup was created',
    example: '2024-01-15T12:00:00Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Date when the backup was last updated',
    example: '2024-01-15T12:05:00Z',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
