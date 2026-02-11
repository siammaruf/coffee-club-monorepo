import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: 'Amount to redeem from customer points' })
    redeem_amount?: number;
}