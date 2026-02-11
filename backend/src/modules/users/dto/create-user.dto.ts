/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsOptional } from "class-validator";
import { Transform, Type } from "class-transformer";
import { BaseUserDto } from "./base-user.dto";
import { CreateBankDto } from "src/modules/banks/dto/create-bank.dto";

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({
    example: 'SecurePassword123',
    description: 'User password (optional - temporary password will be generated if not provided)',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ 
    required: false, 
    type: CreateBankDto,
    description: 'Optional bank information to associate with the user'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown as CreateBankDto;
        return parsed;
      } catch {
        return undefined; 
      }
    }
    return value as CreateBankDto | undefined;
  })
  @Type(() => CreateBankDto)
  bank?: CreateBankDto;
}
