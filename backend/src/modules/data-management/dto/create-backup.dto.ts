import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBackupDto {
  @ApiPropertyOptional({
    description: 'Optional description for the backup',
    example: 'Monthly full backup before system update',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
