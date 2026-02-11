import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ImportMode } from '../enums/import-mode.enum';

export class ImportDataDto {
  @ApiProperty({
    description: 'Import mode: insert only or upsert (insert/update)',
    enum: ImportMode,
    example: ImportMode.INSERT,
  })
  @IsEnum(ImportMode)
  mode: ImportMode;

  @ApiPropertyOptional({
    description: 'Whether to skip rows that produce errors and continue importing',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skip_errors?: boolean = false;
}
