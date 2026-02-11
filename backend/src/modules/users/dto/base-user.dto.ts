import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEmail, IsEnum, IsDate, IsUUID, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { UserRole } from "../enum/user-role.enum";
import { UserStatus } from "../enum/user-status.enum";

export class BaseUserDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id?: string;
  
  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nid_number?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nid_front_picture?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nid_back_picture?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_joined?: Date;

  @ApiProperty({ enum: UserStatus, default: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  @IsOptional()
  status: UserStatus;

  @ApiProperty({ enum: UserRole, default: UserRole.STUFF })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Base salary amount for the user',
    example: 50000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  base_salary?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  created_at?: Date;

  @ApiProperty({
    description: 'Date when the user record was last updated',
    example: '2023-01-01T00:00:00Z',
    required: false
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updated_at?: Date;
}