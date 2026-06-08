import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorPaymentType } from '../enum/vendor-payment-type.enum';

export class CreateVendorPaymentDto {
  @ApiProperty({ description: 'Vendor ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  vendor_id: string;

  @ApiProperty({ description: 'Payment Amount', example: 5000.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment Date (YYYY-MM-DD)', example: '2026-06-08' })
  @IsDateString()
  @IsNotEmpty()
  payment_date: string;

  @ApiProperty({ enum: VendorPaymentType, description: 'Payment Type' })
  @IsEnum(VendorPaymentType)
  @IsNotEmpty()
  payment_type: VendorPaymentType;

  @ApiProperty({ description: 'Optional Note', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'Screenshot URL', required: false })
  @IsString()
  @IsOptional()
  screenshot_url?: string;
}
