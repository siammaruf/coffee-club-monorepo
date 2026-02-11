/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsString, MinLength, Matches } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  @IsOptional()
  password?: string;
}