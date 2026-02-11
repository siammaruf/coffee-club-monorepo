import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsNumber, IsOptional, IsEnum } from "class-validator";
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

  @ApiProperty()
  @IsOptional()
  @IsString()
  expiry_date: Date;
}