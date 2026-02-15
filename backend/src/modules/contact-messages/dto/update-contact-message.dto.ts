import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class UpdateContactMessageDto {
  @ApiProperty({
    description: 'Message status',
    required: false,
    enum: ['new', 'read', 'replied'],
    example: 'read',
  })
  @IsOptional()
  @IsString()
  @IsIn(['new', 'read', 'replied'])
  status?: string;

  @ApiProperty({ description: 'Admin reply text', required: false, example: 'Thank you for reaching out...' })
  @IsOptional()
  @IsString()
  admin_reply?: string;
}
