import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'The value to set for this setting',
    example: 'true',
  })
  @IsNotEmpty()
  @IsString()
  value: string;
}
