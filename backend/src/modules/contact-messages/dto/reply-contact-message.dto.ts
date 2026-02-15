import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyContactMessageDto {
  @ApiProperty({ description: 'Reply message text' })
  @IsNotEmpty()
  @IsString()
  reply: string;
}
