import { OmitType } from '@nestjs/swagger';
import { BaseCategoryDto } from './base-category.dto';

export class CreateCategoryDto extends OmitType(BaseCategoryDto, ['id'] as const) {}