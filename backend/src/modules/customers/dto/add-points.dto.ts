import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddPointsDto {
  @ApiProperty({ description: 'Order amount to calculate points from', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  orderAmount: number;
}
