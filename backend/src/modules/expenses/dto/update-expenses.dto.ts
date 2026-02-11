import { PartialType } from '@nestjs/swagger';
import { BaseExpensesDto } from './base-expenses.dto';

export class UpdateExpensesDto extends PartialType(BaseExpensesDto) {}