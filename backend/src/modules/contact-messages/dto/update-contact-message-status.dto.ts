import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateContactMessageStatusDto {
  @ApiProperty({ description: 'Message status', enum: ['new', 'read', 'replied'] })
  @IsNotEmpty()
  @IsIn(['new', 'read', 'replied'])
  status: string;
}
