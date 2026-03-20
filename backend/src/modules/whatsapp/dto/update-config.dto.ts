import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, Matches } from 'class-validator';

export class UpdateConfigDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  order_notifications_enabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  daily_report_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Daily report time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'daily_report_time must be in HH:mm format' })
  @IsOptional()
  daily_report_time?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  otp_via_whatsapp?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  auto_report_generation_enabled?: boolean;

  @ApiPropertyOptional({ description: 'Auto report generation time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'auto_report_generation_time must be in HH:mm format' })
  @IsOptional()
  auto_report_generation_time?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  order_notification_template?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  daily_report_template?: string;
}
