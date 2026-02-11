import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../orders/enum/order-type.enum';
import { PaymentMethod } from '../../orders/enum/payment-method.enum';

class OrderItemInput {
  @ApiProperty({ description: 'Item ID' })
  @IsNotEmpty()
  @IsUUID()
  item_id: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCustomerOrderDto {
  @ApiProperty({ description: 'Order type', enum: OrderType })
  @IsNotEmpty()
  @IsEnum(OrderType)
  order_type: OrderType;

  @ApiProperty({ description: 'Table IDs for dine-in', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  table_ids?: string[];

  @ApiProperty({ description: 'Delivery address', required: false })
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ description: 'Special instructions', required: false })
  @IsOptional()
  @IsString()
  special_instructions?: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemInput] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];
}
