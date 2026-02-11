import { OmitType } from '@nestjs/swagger';
import { BaseExpenseCategoryDto } from './base-expense-category.dto';

export class CreateExpenseCategoryDto extends OmitType(BaseExpenseCategoryDto, ['id'] as const) {}