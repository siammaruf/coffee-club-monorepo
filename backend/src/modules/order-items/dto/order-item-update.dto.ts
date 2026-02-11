import { PartialType } from "@nestjs/swagger";
import { OrderItemBaseDto } from "./order-item-base.dto";

export class UpdateOrderItemDto extends PartialType(OrderItemBaseDto) {}