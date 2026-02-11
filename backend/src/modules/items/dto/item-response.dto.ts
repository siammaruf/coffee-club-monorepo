import { BaseItemDto } from './base-item.dto';

export class ItemResponseDto extends BaseItemDto {
    constructor(partial: Partial<ItemResponseDto>) {
        super();
        Object.assign(this, partial);
        this.transformImageUrls();
    }

       private transformImageUrls(): void {
        const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
        if (this.image && !this.image.startsWith('http')) {
            this.image = this.image.startsWith('/')
            ? `${baseUrl}${this.image}`
            : `${baseUrl}/${this.image}`;
        }
    }
}