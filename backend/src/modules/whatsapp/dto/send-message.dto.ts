import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'Phone number(s) or group JID(s) to send to' })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ description: 'Message body' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Message type label' })
  @IsString()
  @IsOptional()
  message_type?: string;
}
