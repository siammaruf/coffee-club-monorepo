import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RedeemPointsDto {
  @ApiProperty({ description: 'Amount of points to redeem', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}
