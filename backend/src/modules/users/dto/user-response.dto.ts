/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Type } from "class-transformer";
import { BaseUserDto } from "./base-user.dto";
import { BankResponseDto } from "src/modules/banks/dto/bank-response.dto";

@Exclude()
export class UserResponseDto extends BaseUserDto {
  @ApiProperty({
    description: 'Bank accounts associated with the user',
    type: [BankResponseDto],
    required: false
  })
  @Type(() => BankResponseDto)
  banks?: BankResponseDto[];

  constructor(partial: Partial<UserResponseDto>) {
    super();
    Object.assign(this, partial);
    this.transformImageUrls();
  }

  private transformImageUrls(): void {
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    if (this.picture && !this.picture.startsWith('http')) {
      this.picture = this.picture.startsWith('/') 
        ? `${baseUrl}${this.picture}` 
        : `${baseUrl}/${this.picture}`;
    }
    
    if (this.nid_front_picture && !this.nid_front_picture.startsWith('http')) {
      this.nid_front_picture = this.nid_front_picture.startsWith('/') 
        ? `${baseUrl}${this.nid_front_picture}` 
        : `${baseUrl}/${this.nid_front_picture}`;
    }
    
    if (this.nid_back_picture && !this.nid_back_picture.startsWith('http')) {
      this.nid_back_picture = this.nid_back_picture.startsWith('/') 
        ? `${baseUrl}${this.nid_back_picture}` 
        : `${baseUrl}/${this.nid_back_picture}`;
    }
  }
}