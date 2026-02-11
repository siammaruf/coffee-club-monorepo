import { IsEnum, IsOptional, IsString, IsUUID, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderTokenPriority } from '../enum/OrderTokenPriority.enum';
import { OrderTokenStatus } from '../enum/OrderTokenStatus.enum';
import { TokenType } from '../enum/TokenType.enum';
import { OrderItemResponseDto } from 'src/modules/order-items/dto/order-item-response.dto';

export class BaseOrderTokenDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  token: string;

  @IsEnum(TokenType)
  token_type: TokenType;

  @IsUUID()
  orderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemResponseDto)
  order_items: OrderItemResponseDto[];

  @IsEnum(OrderTokenPriority)
  priority: OrderTokenPriority;

  @IsEnum(OrderTokenStatus)
  status: OrderTokenStatus;

  @IsOptional()
  @IsDateString()
  readyAt?: string;
}