import { BaseCategoryDto } from './base-category.dto';

export class CategoryResponseDto extends BaseCategoryDto {
    constructor(partial: Partial<CategoryResponseDto>) {
        super();
        Object.assign(this, partial);
    }
}