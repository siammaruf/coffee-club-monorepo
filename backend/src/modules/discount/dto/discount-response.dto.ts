import { BaseDiscountDto } from './base-discount.dto';

export class DiscountResponseDto extends BaseDiscountDto {
    constructor(partial: Partial<DiscountResponseDto>) {
        super();
        Object.assign(this, partial);
    }
}