import { IsEnum, IsOptional, IsString, IsUUID, IsObject, IsIP } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({
    enum: ActivityType,
    description: 'Type of activity performed',
    example: ActivityType.ORDER_CREATED
  })
  @IsEnum(ActivityType)
  activity_type: ActivityType;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'New order created for table 5'
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Type of entity involved',
    example: 'order'
  })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiPropertyOptional({
    description: 'ID of the entity involved',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who performed the activity',
    example: 'user-uuid-1'
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'ID of the customer involved',
    example: 'customer-uuid-1'
  })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata about the activity',
    example: { order_amount: 45.50, payment_method: 'CARD' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'IP address from where the activity was performed',
    example: '192.168.1.100'
  })
  @IsOptional()
  @IsIP()
  ip_address?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @IsOptional()
  @IsString()
  user_agent?: string;
}