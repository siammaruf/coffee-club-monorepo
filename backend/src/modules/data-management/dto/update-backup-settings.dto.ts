import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class UpdateBackupSettingsDto {
  @ApiPropertyOptional({
    description: 'Whether automatic backups are enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  auto_backup_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Schedule type for automatic backups',
    example: 'daily',
    enum: ['daily', 'weekly', 'disabled'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'disabled'])
  schedule_type?: string;

  @ApiPropertyOptional({
    description: 'Cron expression for the backup schedule',
    example: '0 0 * * *',
  })
  @IsOptional()
  @IsString()
  cron_expression?: string;

  @ApiPropertyOptional({
    description: 'Number of days to retain backups (1-90)',
    example: 7,
    minimum: 1,
    maximum: 90,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  retention_days?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of backups to keep (1-50)',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  max_backups?: number;

  @ApiPropertyOptional({
    description: 'Google Drive service account email',
    example: 'backup-sa@project.iam.gserviceaccount.com',
  })
  @IsOptional()
  @IsString()
  google_drive_service_account_email?: string;

  @ApiPropertyOptional({
    description: 'Google Drive service account private key',
    example: '-----BEGIN PRIVATE KEY-----\\n...',
  })
  @IsOptional()
  @IsString()
  google_drive_private_key?: string;

  @ApiPropertyOptional({
    description: 'Google Drive folder ID where backups are stored',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
  })
  @IsOptional()
  @IsString()
  google_drive_folder_id?: string;
}
