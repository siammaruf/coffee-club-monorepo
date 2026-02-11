import { OmitType } from "@nestjs/mapped-types";
import { BaseBankDto } from "../../banks/dto/base-bank.dto";

export class CreateBankDto extends OmitType(BaseBankDto, ['id', 'created_at', 'updated_at'] as const) {}