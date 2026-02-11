import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDate } from "class-validator";
import { Type } from "class-transformer";

export class BaseBankDto {
  @ApiProperty({
    description: 'Unique identifier for the bank record',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Name of the bank',
    example: 'Bank of America'
  })
  @IsString()
  bank_name: string;

  @ApiProperty({
    description: 'Name of the branch',
    example: 'Downtown Branch'
  })
  @IsString()
  branch_name: string;

  @ApiProperty({
    description: 'Account number',
    example: '1234567890'
  })
  @IsString()
  account_number: string;

  @ApiProperty({
    description: 'Routing number',
    example: '987654321'
  })
  @IsString()
  routing_number: string;

  @ApiProperty({
    description: 'Date when the bank record was created',
    example: '2023-01-01T00:00:00Z',
    required: false
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  created_at?: Date;

  @ApiProperty({
    description: 'Date when the bank record was last updated',
    example: '2023-01-01T00:00:00Z',
    required: false
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updated_at?: Date;
}