import { OmitType } from '@nestjs/swagger';
import { BaseExpensesDto } from './base-expenses.dto';

export class CreateExpensesDto extends OmitType(BaseExpensesDto, ['id'] as const) {}