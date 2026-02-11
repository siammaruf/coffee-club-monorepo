import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNumber, IsString, IsEnum, IsOptional } from "class-validator";
import { TableStatus } from "../enum/table-status.enum";

export class BaseTableDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: "T1", description: "Table number or identifier" })
  @IsString()
  number: string;

  @ApiProperty({ example: 4, description: "Number of seats at the table" })
  @IsNumber()
  seat: number;

  @ApiProperty({ required: false, example: "Corner table with window view", description: "Additional description of the table" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, example: "Main Floor", description: "Location or section where the table is situated" })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ 
    enum: TableStatus, 
    default: TableStatus.AVAILABLE,
    example: TableStatus.AVAILABLE,
    description: "Current status of the table"
  })
  @IsEnum(TableStatus)
  status: TableStatus;
}