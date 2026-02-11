import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ExpenseStatus } from '../enum/expense-status.enum';

export class BaseExpensesDto {
    @ApiProperty({ description: 'Expense ID', example: 'uuid-string' })
    @IsUUID()
    @IsOptional()
    id?: string;

    @ApiProperty({ description: 'Expense title', example: 'Monthly Rent' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Expense amount', example: 1000.50 })
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'Expense category', example: 'Utilities' })
    @IsString()
    category_id: string;

    @ApiProperty({ description: 'Additional notes about the expense', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Expense status', example: 'pending' })
    @IsString()
    @IsOptional()
    status?: ExpenseStatus;
}