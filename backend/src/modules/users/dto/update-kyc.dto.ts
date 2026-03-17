import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateKycDto {
  @ApiProperty({ required: false, description: 'National ID number' })
  @IsOptional()
  @IsString()
  nid_number?: string;

  @ApiProperty({ required: false, description: 'Residential address' })
  @IsOptional()
  @IsString()
  address?: string;
}
