import { OmitType } from '@nestjs/swagger';
import { BaseItemDto } from './base-item.dto';

export class CreateItemDto extends OmitType(BaseItemDto, ['id'] as const) {}