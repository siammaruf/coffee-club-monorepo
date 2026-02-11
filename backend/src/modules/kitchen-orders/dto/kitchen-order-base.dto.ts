import { IsUUID, IsOptional, IsString, IsBoolean, IsArray, ValidateNested, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateKitchenOrderItemDto } from "./create-kitchen-order-item.dto";
import { User } from "../../users/entities/user.entity";

export class BaseKitchenOrderDto {
    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    order_id?: string;

    @ApiProperty({ 
        description: 'User who created this kitchen order',
        type: () => User,
        required: false 
    })
    @Type(() => User)
    @IsOptional()
    user?: User;

    @ApiProperty({ 
        format: 'uuid',
        description: 'User ID for direct reference',
        required: false
    })
    @IsUUID()
    @IsOptional()
    user_id?: string;

    @ApiProperty({
        description: 'Kitchen order items',
        type: () => [CreateKitchenOrderItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateKitchenOrderItemDto)
    order_items: CreateKitchenOrderItemDto[];

    @ApiProperty({ required: false, default: false })
    @IsBoolean()
    @IsOptional()
    is_approved?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    total_amount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    created_at?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    updated_at?: Date;
}