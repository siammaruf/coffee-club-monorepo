import { PartialType, OmitType } from '@nestjs/swagger';
import { BaseExpenseCategoryDto } from './base-expense-category.dto';

export class UpdateExpenseCategoryDto extends PartialType(
  OmitType(BaseExpenseCategoryDto, ['id'] as const),
) {}