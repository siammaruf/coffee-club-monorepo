import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsDate, IsNumber, IsOptional, IsBoolean, IsString } from "class-validator";
import { Type } from "class-transformer";

export class BaseSalaryDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty({ type: String, format: 'date' })
  @Type(() => Date)
  @IsDate()
  month: Date;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  base_salary: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bonus?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deductions?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  total_payble: number;

  @ApiProperty({ required: false, description: 'Path to the bank receipt image' })
  @IsOptional()
  @IsString()
  receipt_image?: string;

  @ApiProperty({ required: false, description: 'Additional notes or remarks about this salary record' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, default: false, description: 'Whether the salary has been paid' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_paid?: boolean;

  @ApiProperty({ required: false, type: String, format: 'date-time', description: 'Record creation timestamp (used as payment date)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_at?: Date;

  @ApiProperty({ required: false, type: String, format: 'date-time', description: 'Record last update timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updated_at?: Date;
}