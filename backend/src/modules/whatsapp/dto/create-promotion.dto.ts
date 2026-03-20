import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PromotionTarget } from '../enums';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Internal title/label for the promotion' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'WhatsApp message body' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: PromotionTarget, default: PromotionTarget.ALL })
  @IsEnum(PromotionTarget)
  @IsOptional()
  target?: PromotionTarget;
}
