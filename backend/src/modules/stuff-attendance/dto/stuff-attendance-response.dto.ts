import { BaseStuffAttendanceDto } from "./base-stuff-attendance.dto";
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { StuffAttendance } from '../entities/stuff-attendance.entity';

export class StuffAttendanceResponseDto extends BaseStuffAttendanceDto {
    constructor(partial: Partial<StuffAttendanceResponseDto> | StuffAttendance) {
        super();
        
        if ('user' in partial && partial.user) {
            const { user, approver, ...rest } = partial as Partial<StuffAttendanceResponseDto>;
            Object.assign(this, rest);
            if (user) {
                (this as StuffAttendanceResponseDto).user = new UserResponseDto(user);
            }
            if (approver) {
                (this as StuffAttendanceResponseDto).approver = new UserResponseDto(approver);
            }
        } else {
            Object.assign(this, partial);
        }
    }
}