import { PartialType } from '@nestjs/swagger';
import { BaseTableDto } from './base-table.dto';

export class UpdateTableDto extends PartialType(BaseTableDto) {}