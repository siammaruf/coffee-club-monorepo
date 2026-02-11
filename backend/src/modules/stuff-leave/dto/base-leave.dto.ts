import { IsDate, IsEnum, IsString, IsUUID } from 'class-validator';
import { LeaveStatus } from '../enum/leave-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class BaseLeaveDto {
    @ApiProperty({ description: 'ID of the user requesting leave' })
    @IsUUID()
    user_id: string;

    @ApiProperty({ description: 'Type of leave being requested' })
    @IsString()
    leave_type: string;

    @ApiProperty({ description: 'Start date of the leave' })
    @IsDate()
    leave_start_date: Date;

    @ApiProperty({ description: 'End date of the leave' })
    @IsDate()
    leave_end_date: Date;

    @ApiProperty({ description: 'Reason for requesting leave' })
    @IsString()
    reason: string;
}