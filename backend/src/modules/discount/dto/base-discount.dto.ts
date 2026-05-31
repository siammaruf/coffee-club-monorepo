import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsNumber, IsOptional, IsEnum, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { DiscountType } from "../enum/discount-type.enum";  // Make sure you import the DiscountType enum

export class BaseDiscountDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty()
  @IsNumber()
  discount_value: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  expiry_date: Date;
}