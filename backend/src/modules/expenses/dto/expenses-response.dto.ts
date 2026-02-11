/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BaseExpensesDto } from './base-expenses.dto';
import { Expenses } from '../entities/expenses.entity';

export class ExpensesResponseDto extends BaseExpensesDto {
    constructor(expense: Expenses) {
        super();
        Object.assign(this, expense);
    }
}