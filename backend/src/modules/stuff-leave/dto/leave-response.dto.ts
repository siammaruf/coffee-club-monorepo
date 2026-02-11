import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BaseLeaveDto } from './base-leave.dto';
import { LeaveStatus } from '../enum/leave-status.enum';
import { User } from '../../users/entities/user.entity';

export class LeaveResponseDto extends BaseLeaveDto {
    @ApiProperty({ description: 'Unique identifier of the leave request' })
    id: string;

    @ApiProperty({ description: 'Status of the leave request', enum: LeaveStatus })
    @IsEnum(LeaveStatus)
    status: LeaveStatus;

    @ApiProperty({ description: 'User who requested the leave', type: () => User })
    user: User;

    constructor(partial: Partial<LeaveResponseDto>) {
        super();
        Object.assign(this, partial);
    }
}