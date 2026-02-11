import { BaseTableDto } from './base-table.dto';

export class TableResponseDto extends BaseTableDto {
  constructor(partial: Partial<TableResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}