import { BaseBankDto } from "../../banks/dto/base-bank.dto";

export class BankResponseDto extends BaseBankDto {
  constructor(partial: Partial<BankResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}