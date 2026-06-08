import { ApiProperty } from '@nestjs/swagger';
import { VendorPaymentType } from '../enum/vendor-payment-type.enum';

class VendorRefDto {
  @ApiProperty() id: string;
  @ApiProperty() vendor_name: string;
}

export class VendorPaymentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() vendor_id: string;
  @ApiProperty({ type: () => VendorRefDto }) vendor: VendorRefDto;
  @ApiProperty() amount: number;
  @ApiProperty() payment_date: string;
  @ApiProperty({ enum: VendorPaymentType }) payment_type: VendorPaymentType;
  @ApiProperty({ nullable: true }) note: string | null;
  @ApiProperty({ nullable: true }) screenshot_url: string | null;
  @ApiProperty({ nullable: true }) created_by_id: string | null;
  @ApiProperty({ nullable: true }) deleted_at: Date | null;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}
