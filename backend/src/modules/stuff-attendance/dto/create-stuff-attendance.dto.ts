import { OmitType } from '@nestjs/swagger';
import { BaseStuffAttendanceDto } from './base-stuff-attendance.dto';

export class CreateStuffAttendanceDto extends OmitType(BaseStuffAttendanceDto, ['id']) {}