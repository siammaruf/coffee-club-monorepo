import { OmitType } from '@nestjs/swagger';
import { BaseTableDto } from './base-table.dto';

export class CreateTableDto extends OmitType(BaseTableDto, ['id'] as const) {}