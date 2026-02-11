import { ApiProperty } from "@nestjs/swagger";
import { BaseKitchenOrderDto } from "./kitchen-order-base.dto";
import { KitchenOrderItemDto } from "./kitchen-order-item.dto";
import { KitchenOrder } from "../entities/kitchen-order.entity";
import { User } from "../../users/entities/user.entity";

export class KitchenOrderItemResponseDto extends KitchenOrderItemDto {
    @ApiProperty({ required: false })
    kitchen_stock?: {
        id: string;
        kitchen_item?: {
            id: string;
            name: string;
            type: string;
        };
        quantity: number;
        price: number;
    };
}

export class KitchenOrderResponseDto extends BaseKitchenOrderDto {
    @ApiProperty({ type: [KitchenOrderItemResponseDto] })
    order_items: KitchenOrderItemResponseDto[];

    constructor(kitchenOrder: KitchenOrder) {
        super();
        this.id = kitchenOrder.id;
        this.order_id = kitchenOrder.order_id;
        this.user = kitchenOrder.user;
        this.is_approved = kitchenOrder.is_approved;
        this.description = kitchenOrder.description;
        this.total_amount = kitchenOrder.total_amount;
        this.created_at = kitchenOrder.created_at;
        this.updated_at = kitchenOrder.updated_at;
        
        this.order_items = kitchenOrder.order_items?.map(item => ({
            id: item.id,
            kitchen_stock_id: item.kitchen_stock?.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: item.created_at,
            updated_at: item.updated_at,
            kitchen_stock: item.kitchen_stock ? {
                id: item.kitchen_stock.id,
                kitchen_item: item.kitchen_stock.kitchen_item ? {
                    id: item.kitchen_stock.kitchen_item.id,
                    name: item.kitchen_stock.kitchen_item.name,
                    type: item.kitchen_stock.kitchen_item.type,
                    name_bn: item.kitchen_stock.kitchen_item.name_bn,
                    image: item.kitchen_stock.kitchen_item.image,
                } : undefined,
                quantity: item.kitchen_stock.quantity,
                price: item.kitchen_stock.price,
            } : undefined,
        })) || [];
    }
}