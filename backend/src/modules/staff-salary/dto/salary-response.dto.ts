import { Exclude } from "class-transformer";
import { BaseSalaryDto } from "./base-salary.dto";

interface UserWithPicture {
  id: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  role?: string;
  picture?: string;
}

export class SalaryResponseDto extends BaseSalaryDto {
  user?: UserWithPicture;

  constructor(partial: Partial<SalaryResponseDto>) {
    super();
    Object.assign(this, partial);
    this.transformImageUrls();
  }

  private transformImageUrls(): void {
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    if (this.receipt_image && typeof this.receipt_image === 'string' && !this.receipt_image.startsWith('http')) {
      this.receipt_image = this.receipt_image.startsWith('/')
        ? `${baseUrl}${this.receipt_image}`
        : `${baseUrl}/${this.receipt_image}`;
    }
    // Transform user.picture if present
    if (this.user && typeof this.user.picture === 'string' && !this.user.picture.startsWith('http')) {
      this.user.picture = this.user.picture.startsWith('/')
        ? `${baseUrl}${this.user.picture}`
        : `${baseUrl}/${this.user.picture}`;
    }
  }
}