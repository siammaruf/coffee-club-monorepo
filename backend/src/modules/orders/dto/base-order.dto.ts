import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsNumber, IsString } from 'class-validator';
import { OrderType } from '../enum/order-type.enum';
import { OrderStatus } from '../enum/order-status.enum';
import { PaymentMethod } from '../enum/payment-method.enum';
import { Type } from 'class-transformer';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { Table } from '../../table/entities/table.entity';
import { Discount } from '../../discount/entities/discount.entity';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from '../../order-items/dto/order-item-create.dto';
import { OrderTokenResponseDto } from 'src/modules/order-tokens/dto/order-token-response.dto';

export class BaseOrderDto {
    @ApiPropertyOptional({ format: 'uuid' })
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiPropertyOptional({ format: 'uuid' })
    @IsUUID()
    @IsOptional()
    order_id?: string;

    @ApiPropertyOptional({ enum: OrderType, default: OrderType.DINEIN })
    @IsEnum(OrderType)
    @IsOptional()
    order_type?: OrderType;

    @ApiProperty({
        description: 'Tables associated with this order',
        type: () => [Table],
    })
    @IsArray()
    @Type(() => Table)
    tables: Table[];

    @ApiPropertyOptional({
        description: 'Customer details associated with this order',
        type: () => Customer,
    })
    @Type(() => Customer)
    @IsOptional()
    customer?: Customer;

    @ApiPropertyOptional({ 
        format: 'uuid',
        description: 'Customer ID for direct reference'
    })
    @IsUUID()
    @IsOptional()
    customer_id?: string;

    @ApiProperty({
        description: 'User details associated with this order',
        type: () => User,
    })
    @Type(() => User)
    user: User;

    @ApiPropertyOptional({ 
        format: 'uuid',
        description: 'User ID for direct reference'
    })
    @IsUUID()
    @IsOptional()
    user_id?: string;

    @ApiProperty({ enum: OrderStatus, default: OrderStatus.PENDING })
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @ApiPropertyOptional({ 
        type: Number,
        description: 'Subtotal amount before discounts and taxes'
    })
    @IsNumber()
    @IsOptional()
    sub_total?: number;

    @ApiPropertyOptional({ type: Number })
    @IsNumber()
    @IsOptional()
    total_amount?: number;

    @ApiPropertyOptional({
        description: 'Discount applied to the order',
        type: () => Discount,
    })
    @Type(() => Discount)
    @IsOptional()
    discount?: Discount;

    @ApiPropertyOptional({ 
        format: 'uuid',
        description: 'Discount ID for direct reference',
        nullable:true,
    })
    @IsUUID()
    @IsOptional()
    discount_id?: string;

    @ApiPropertyOptional({ type: Number, description: 'Discount amount applied to the order' })
    @IsNumber()
    @IsOptional()
    discount_amount?: number;

    @ApiPropertyOptional({ type: Number, description: 'Total time taken to complete the order in minutes' })
    @IsNumber()
    @IsOptional()
    completion_time?: number;

    @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CASH })
    @IsEnum(PaymentMethod)
    @IsOptional()
    payment_method?: PaymentMethod;

    @ApiProperty({
        description: 'Order items associated with this order',
        type: () => [CreateOrderItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    order_items: CreateOrderItemDto[];

       @ApiPropertyOptional({
        type: 'object',
        properties: {
            bar: { type: () => OrderTokenResponseDto },
            kitchen: { type: () => OrderTokenResponseDto }
        }
    })
    @IsOptional()
    order_tokens?: {
        bar: OrderTokenResponseDto | null;
        kitchen: OrderTokenResponseDto | null;
    };

    @ApiPropertyOptional({
        description: 'Order tables junction data',
        type: () => [String],
        example: ['table-uuid-1', 'table-uuid-2']
    })
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    order_tables?: string[];

    @ApiPropertyOptional({
        description: 'Date the order item was created',
        example: '2025-06-14T12:00:00.000Z',
    })
    @IsOptional()
    created_at?: Date;

    @ApiPropertyOptional({
        description: 'Date the order item was last updated',
        example: '2025-06-14T14:00:00.000Z',
    })
    @IsOptional()
    updated_at?: Date;
}
