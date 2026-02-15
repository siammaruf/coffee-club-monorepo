import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAttendanceDto {
  @ApiProperty({ description: 'ID of the user approving the attendance' })
  @IsNotEmpty()
  @IsString()
  approved_by: string;
}
