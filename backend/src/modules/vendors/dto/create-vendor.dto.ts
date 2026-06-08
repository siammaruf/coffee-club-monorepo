import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { VendorType } from '../enum/vendor-type.enum';
import { VendorStatus } from '../enum/vendor-status.enum';

export class CreateVendorDto {
  @ApiProperty({ description: 'Vendor / Shop Name', example: 'Fresh Foods Ltd.' })
  @IsString()
  @IsNotEmpty()
  vendor_name: string;

  @ApiProperty({ description: 'Contact Person Name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  contact_person: string;

  @ApiProperty({ enum: VendorType, description: 'Vendor Type' })
  @IsEnum(VendorType)
  @IsNotEmpty()
  vendor_type: VendorType;

  @ApiProperty({ description: 'Vendor Address', example: '123 Main St, Dhaka' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Mobile Number', example: '01712345678' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ description: 'Email Address', example: 'vendor@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: VendorStatus, default: VendorStatus.ACTIVE, required: false })
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;
}
