import { ApiProperty } from '@nestjs/swagger';
import { VendorType } from '../enum/vendor-type.enum';
import { VendorStatus } from '../enum/vendor-status.enum';

export class VendorResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() vendor_name: string;
  @ApiProperty() contact_person: string;
  @ApiProperty({ enum: VendorType }) vendor_type: VendorType;
  @ApiProperty() address: string;
  @ApiProperty() mobile: string;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ enum: VendorStatus }) status: VendorStatus;
  @ApiProperty({ nullable: true }) deleted_at: Date | null;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}
