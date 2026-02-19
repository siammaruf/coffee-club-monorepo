import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, IsNumber, ValidateIf } from 'class-validator';
import { CustomerType } from '../enum/customer-type.enum';

export class BaseCustomerDto {
    @ApiPropertyOptional({ format: 'uuid' })
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    phone: string;

    @ApiPropertyOptional()
    @ValidateIf((o) => o.email !== '' && o.email !== null)
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    note?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    picture?: string;

    @ApiPropertyOptional({
        enum: CustomerType,
        description: 'Customer type: regular or member',
        default: CustomerType.REGULAR,
    })
    @IsEnum(CustomerType)
    @IsOptional()
    customer_type?: CustomerType;

    @ApiPropertyOptional({ 
        type: Number,
        description: 'Customer loyalty points',
        default: 0
    })
    @IsNumber()
    @IsOptional()
    points?: number;

    @ApiPropertyOptional({ 
        type: Number,
        description: 'Customer balance in taka',
        default: 0
    })
    @IsNumber()
    @IsOptional()
    balance?: number;

    @ApiPropertyOptional({
        description: 'Date the customer was created',
        example: '2025-06-14T12:00:00.000Z',
    })
    @IsOptional()
    created_at?: Date;

    @ApiPropertyOptional({
        description: 'Date the customer was last updated',
        example: '2025-06-14T14:00:00.000Z',
    })
    @IsOptional()
    updated_at?: Date;
}