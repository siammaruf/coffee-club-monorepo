import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { StuffAttendance } from '../entities/stuff-attendance.entity';
import { CreateStuffAttendanceDto } from '../dto/create-stuff-attendance.dto';
import { UpdateStuffAttendanceDto } from '../dto/update-stuff-attendance.dto';
import { StuffAttendanceResponseDto } from '../dto/stuff-attendance-response.dto';
import { User } from '../../users/entities/user.entity';
import { AttendanceStatus } from '../enum/attendance-status.enum';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class StuffAttendanceService {
  constructor(
    @InjectRepository(StuffAttendance)
    private readonly stuffAttendanceRepository: Repository<StuffAttendance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheService: CacheService,
  ) {}

  async create(createDto: CreateStuffAttendanceDto): Promise<StuffAttendanceResponseDto> {
    const user = await this.userRepository.findOne({ 
      where: { id: createDto.user_id }, 
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${createDto.user_id} not found`);
    }
    
    const existingAttendance = await this.stuffAttendanceRepository.findOne({
      where: {
        user: { id: createDto.user_id },
        attendance_date: createDto.attendance_date
      }
    });
    
    if (existingAttendance) {
      throw new BadRequestException('Attendance record already exists for this date');
    }
    
    let workHours = 0;
    if (createDto.check_in && createDto.check_out) {
      const checkIn = new Date(createDto.check_in);
      const checkOut = new Date(createDto.check_out);
      workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }
    
    const attendance = this.stuffAttendanceRepository.create({
      user: user,
      attendance_date: createDto.attendance_date,
      check_in: createDto.check_in,
      check_out: createDto.check_out,
      status: createDto.status || AttendanceStatus.PRESENT,
      work_hours: workHours,
      overtime_hours: createDto.overtime_hours || 0,
      notes: createDto.notes
    });

    const savedAttendance = await this.stuffAttendanceRepository.save(attendance);
    await this.invalidateAttendanceCaches();
    return new StuffAttendanceResponseDto(savedAttendance);
  }

  async findAll(options?: { 
    startDate?: Date, 
    endDate?: Date, 
    userId?: string,
    status?: AttendanceStatus,
    page?: number,
    limit?: number
  }): Promise<{ 
    data: StuffAttendanceResponseDto[], 
    total: number, 
    page: number,
    limit: number,
    totalPages: number 
  }> {
    const cacheKey = `attendance:findAll:${JSON.stringify(options || {})}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as { 
        data: StuffAttendanceResponseDto[], 
        total: number, 
        page: number, 
        limit: number, 
        totalPages: number 
      };
    }

    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.first_name', 'user.last_name', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.first_name', 'approver.last_name', 'approver.id', 'approver.role']);
    
    if (options?.userId) {
      query.andWhere('attendance.user_id = :userId', { userId: options.userId });
    }
    
    if (options?.status) {
      query.andWhere('attendance.status = :status', { status: options.status });
    }
    
    if (options?.startDate && options?.endDate) {
      query.andWhere('attendance.attendance_date BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate
      });
    } else if (options?.startDate) {
      query.andWhere('attendance.attendance_date >= :startDate', { startDate: options.startDate });
    } else if (options?.endDate) {
      query.andWhere('attendance.attendance_date <= :endDate', { endDate: options.endDate });
    }
    
    query.orderBy('attendance.attendance_date', 'DESC');
    
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    query.skip((page - 1) * limit).take(limit);
    
    const [records, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    
    const result = { 
      data: records.map(record => new StuffAttendanceResponseDto(record)), 
      total, 
      page,
      limit,
      totalPages
    };

    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: string): Promise<StuffAttendanceResponseDto> {
    const cacheKey = `attendance:findOne:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return new StuffAttendanceResponseDto(cached);
    }

    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.id = :id', { id });  

    const attendance = await query.getOne();
    
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    
    const result = new StuffAttendanceResponseDto(attendance);
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findByUserAndDate(userId: string, date: Date): Promise<StuffAttendanceResponseDto> {
    const cacheKey = `attendance:findByUserAndDate:${userId}:${date.toISOString()}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return new StuffAttendanceResponseDto(cached);
    }

    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.user_id = :userId', { userId })
      .andWhere('attendance.attendance_date = :date', { date });

    const attendance = await query.getOne();
    
    if (!attendance) {
      throw new NotFoundException(`Attendance record not found for user ${userId} on ${date.toISOString()}`);
    }

    const result = new StuffAttendanceResponseDto(attendance);
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async update(id: string, updateDto: UpdateStuffAttendanceDto): Promise<StuffAttendanceResponseDto> {
    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.id = :id', { id });
    
    const attendance = await query.getOne();
    
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    
    if (updateDto.user_id) {
      const user = await this.userRepository.findOne({ where: { id: updateDto.user_id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${updateDto.user_id} not found`);
      }
      attendance.user = user;
    }
    
    if (updateDto.check_in && updateDto.check_out) {
      const checkIn = new Date(updateDto.check_in);
      const checkOut = new Date(updateDto.check_out);
      updateDto.work_hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    }
    
    if (updateDto.attendance_date) attendance.attendance_date = updateDto.attendance_date;
    if (updateDto.check_in) attendance.check_in = updateDto.check_in;
    if (updateDto.check_out) attendance.check_out = updateDto.check_out;
    if (updateDto.status) attendance.status = updateDto.status;
    if (updateDto.work_hours !== undefined) attendance.work_hours = updateDto.work_hours;
    if (updateDto.overtime_hours !== undefined) attendance.overtime_hours = updateDto.overtime_hours;
    if (updateDto.notes !== undefined) attendance.notes = updateDto.notes;
    if (updateDto.is_approved !== undefined) attendance.is_approved = updateDto.is_approved;

    const updatedAttendance = await this.stuffAttendanceRepository.save(attendance);
    await this.invalidateAttendanceCaches();
    return new StuffAttendanceResponseDto(updatedAttendance);
  }

  async checkIn(userId: string, checkInData: {
    notes?: string
  }): Promise<StuffAttendanceResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendance = await this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.user_id = :userId', { userId })
      .andWhere('attendance.attendance_date = :date', { date: today })
      .getOne();
    
    if (attendance) {
      if (attendance.check_in) {
        throw new BadRequestException('Check-in already recorded for today');
      }
    } else {
      attendance = this.stuffAttendanceRepository.create({
        user: user,
        attendance_date: today,
        status: AttendanceStatus.PRESENT
      });
    }
    
    const now = new Date();
    attendance.check_in = now;
    if (checkInData.notes) attendance.notes = checkInData.notes;

    const savedAttendance = await this.stuffAttendanceRepository.save(attendance);
    await this.invalidateAttendanceCaches();
    return new StuffAttendanceResponseDto(savedAttendance);
  }

  async checkOut(userId: string, checkOutData: {
    notes?: string,
    overtime_hours?: number
  }): Promise<StuffAttendanceResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.user_id = :userId', { userId })
      .andWhere('attendance.attendance_date = :date', { date: today });
    
    const attendance = await query.getOne();
    
    if (!attendance) {
      throw new NotFoundException('No check-in record found for today');
    }
    
    if (!attendance.check_in) {
      throw new BadRequestException('Cannot check out without checking in first');
    }
    
    if (attendance.check_out) {
      throw new BadRequestException('Check-out already recorded for today');
    }
    
    const now = new Date();
    attendance.check_out = now;
    
    if (checkOutData.notes) attendance.notes = checkOutData.notes;
    if (checkOutData.overtime_hours) attendance.overtime_hours = checkOutData.overtime_hours;
    
    const checkIn = new Date(attendance.check_in);
    const checkOut = now;
    attendance.work_hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    const updatedAttendance = await this.stuffAttendanceRepository.save(attendance);
    await this.invalidateAttendanceCaches();
    return new StuffAttendanceResponseDto(updatedAttendance);
  }

  async approve(id: string, approveDto: { approved_by: string }): Promise<StuffAttendanceResponseDto> {
    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.id = :id', { id });
    
    const attendance = await query.getOne();
    
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    
    attendance.is_approved = true;
    attendance.approved_by = approveDto.approved_by;

    const updatedAttendance = await this.stuffAttendanceRepository.save(attendance);
    await this.invalidateAttendanceCaches();
    return new StuffAttendanceResponseDto(updatedAttendance);
  }

  async getMonthlyReport(userId: string, year: number, month: number): Promise<{ 
    totalDays: number,
    presentDays: number,
    absentDays: number,
    lateDays: number,
    onLeaveDays: number,
    totalWorkHours: number,
    totalOvertimeHours: number,
    attendanceRecords: StuffAttendanceResponseDto[]
  }> {
    const cacheKey = `attendance:monthlyReport:${userId}:${year}:${month}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as {
        totalDays: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
        onLeaveDays: number;
        totalWorkHours: number;
        totalOvertimeHours: number;
        attendanceRecords: StuffAttendanceResponseDto[];
      };
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.approver', 'approver')
      .addSelect(['user.firstName', 'user.lastName', 'user.id', 'user.role', 'user.picture', 'user.status'])
      .addSelect(['approver.firstName', 'approver.lastName', 'approver.id', 'approver.role'])
      .where('attendance.user_id = :userId', { userId })
      .andWhere('attendance.attendance_date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.attendance_date', 'ASC');
    
    const attendanceRecords = await query.getMany();
    
    const presentDays = attendanceRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absentDays = attendanceRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const lateDays = attendanceRecords.filter(r => r.status === AttendanceStatus.LATE).length;
    const onLeaveDays = attendanceRecords.filter(r => r.status === AttendanceStatus.ON_LEAVE).length;
    
    const totalWorkHours = attendanceRecords.reduce((sum, record) => sum + (record.work_hours || 0), 0);
    const totalOvertimeHours = attendanceRecords.reduce((sum, record) => sum + (record.overtime_hours || 0), 0);
    
    const result = {
      totalDays: endDate.getDate(),
      presentDays,
      absentDays,
      lateDays,
      onLeaveDays,
      totalWorkHours,
      totalOvertimeHours,
      attendanceRecords: attendanceRecords.map(record => new StuffAttendanceResponseDto(record))
    };

    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.stuffAttendanceRepository.findOne({
      where: { id }
    });
    
    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
    
    await this.stuffAttendanceRepository.remove(attendance);
    await this.invalidateAttendanceCaches();
  }

  private async invalidateAttendanceCaches(): Promise<void> {
    const patterns = [
      'attendance:*'
    ];

    for (const pattern of patterns) {
      const keys = await this.cacheService.getKeys(pattern);
      if (keys.length > 0) {
        await this.cacheService.deleteMany(keys);
      }
    }
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.stuffAttendanceRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.stuffAttendanceRepository.createQueryBuilder('attendance')
            .withDeleted()
            .where('attendance.deleted_at IS NOT NULL');

        query.orderBy('attendance.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.stuffAttendanceRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.stuffAttendanceRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.stuffAttendanceRepository.delete(id);
    }
}
