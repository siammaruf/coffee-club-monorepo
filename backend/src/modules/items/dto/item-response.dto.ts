import { BaseItemDto } from './base-item.dto';

export class ItemResponseDto extends BaseItemDto {
    constructor(partial: Partial<ItemResponseDto>) {
        super();
        Object.assign(this, partial);
        this.computeDisplayPrice();
        this.transformImageUrls();
    }

    private computeDisplayPrice(): void {
        if (this.has_variations && this.variations && this.variations.length > 0) {
            const prices = this.variations
                .map(v => parseFloat(String(v.regular_price)) || 0)
                .filter(p => p > 0);
            if (prices.length > 0) {
                this.regular_price = Math.min(...prices);
            }
            const salePrices = this.variations
                .map(v => parseFloat(String(v.sale_price)) || 0)
                .filter(p => p > 0);
            if (salePrices.length > 0) {
                this.sale_price = Math.min(...salePrices);
            }
        }
        // Ensure numeric types (PostgreSQL decimal returns strings)
        this.regular_price = parseFloat(String(this.regular_price)) || 0;
        if (this.sale_price) {
            this.sale_price = parseFloat(String(this.sale_price)) || 0;
        }
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