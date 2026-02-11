import { BaseExpenseCategoryDto } from './base-expense-category.dto';

export class ExpenseCategoryResponseDto extends BaseExpenseCategoryDto {
    constructor(partial: Partial<ExpenseCategoryResponseDto>) {
        super();
        Object.assign(this, partial);
    }
}