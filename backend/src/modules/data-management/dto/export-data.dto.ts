import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ExportGroup } from '../enums/export-group.enum';

export class ExportDataDto {
  @ApiProperty({
    description: 'Data groups to export',
    enum: ExportGroup,
    isArray: true,
    example: [ExportGroup.MENU, ExportGroup.ORDERS],
  })
  @IsArray()
  @IsEnum(ExportGroup, { each: true })
  groups: ExportGroup[];

  @ApiPropertyOptional({
    description: 'Start date for filtering exported data (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering exported data (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}
