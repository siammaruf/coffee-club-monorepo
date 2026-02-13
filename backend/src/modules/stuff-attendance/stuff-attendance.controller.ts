import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StuffAttendanceService } from './providers/stuff-attendance.service';
import { CreateStuffAttendanceDto } from './dto/create-stuff-attendance.dto';
import { UpdateStuffAttendanceDto } from './dto/update-stuff-attendance.dto';
import { StuffAttendanceResponseDto } from './dto/stuff-attendance-response.dto';
import { AttendanceStatus } from './enum/attendance-status.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('Staff Attendance')
@Controller('stuff-attendance')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STUFF, UserRole.BARISTA, UserRole.CHEF)
export class StuffAttendanceController {
  constructor(private readonly stuffAttendanceService: StuffAttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({ 
    status: 201, 
    description: 'Attendance record created successfully',
    type: StuffAttendanceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or duplicate record' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async create(@Body() createDto: CreateStuffAttendanceDto): Promise<{
    data: StuffAttendanceResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const response = await this.stuffAttendanceService.create(createDto);
    return {
      data: response,
      status: 'success',
      message: 'Attendance record created successfully',
      statusCode: HttpStatus.CREATED
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records with optional filtering' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, enum: AttendanceStatus, enumName: 'AttendanceStatus', description: 'Filter by attendance status' })
  @ApiQuery({ name: 'startDate', required: false, type: Date, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: Date, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a paginated list of attendance records',
    type: StuffAttendanceResponseDto,
    isArray: true
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: AttendanceStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    data: StuffAttendanceResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    let startDateObj: Date | undefined;
    let endDateObj: Date | undefined;
    
    if (startDate) {
      startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        throw new BadRequestException('Invalid start date format. Use YYYY-MM-DD');
      }
    }
    
    if (endDate) {
      endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        throw new BadRequestException('Invalid end date format. Use YYYY-MM-DD');
      }
    }
    
    const { data, total, totalPages } = await this.stuffAttendanceService.findAll({
      page: pageNumber,
      limit: limitNumber,
      userId,
      status,
      startDate: startDateObj,
      endDate: endDateObj
    });
    
    return {
      data,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Attendance records retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiParam({ name: 'id', description: 'Attendance record ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the attendance record',
    type: StuffAttendanceResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    data: StuffAttendanceResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const response = await this.stuffAttendanceService.findOne(id);
    return {
      data: response,
      status: 'success',
      message: 'Attendance record retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance record ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Attendance record updated successfully',
    type: StuffAttendanceResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateDto: UpdateStuffAttendanceDto
  ): Promise<{
    data: StuffAttendanceResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const response = await this.stuffAttendanceService.update(id, updateDto);
    return {
      data: response,
      status: 'success',
      message: 'Attendance record updated successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance record ID' })
  @ApiResponse({ status: 200, description: 'Attendance record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    await this.stuffAttendanceService.remove(id);
    return {
      status: 'success',
      message: 'Attendance record deleted successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Post('check-in/:userId')
  @ApiOperation({ summary: 'Record check-in for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Check-in recorded successfully',
    type: StuffAttendanceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Already checked in or other validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async checkIn(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() data: { notes?: string }
  ): Promise<{
    data: StuffAttendanceResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const response = await this.stuffAttendanceService.checkIn(userId, data);
    return {
      data: response,
      status: 'success',
      message: 'Check-in recorded successfully',
      statusCode: HttpStatus.CREATED
    };
  }

  @Post('check-out/:userId')
  @ApiOperation({ summary: 'Record check-out for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Check-out recorded successfully',
    type: StuffAttendanceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'No check-in record or already checked out' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async checkOut(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() data: { notes?: string, overtime_hours?: number }
  ): Promise<{
    data: StuffAttendanceResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const response = await this.stuffAttendanceService.checkOut(userId, data);
    return {
      data: response,
      status: 'success',
      message: 'Check-out recorded successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Post('approve/:id')
  @ApiOperation({ summary: 'Approve an attendance record' })
  @ApiParam({ name: 'id', description: 'Attendance record ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approved_by: {
          type: 'string',
          format: 'uuid',
          description: 'UUID of the user approving the attendance'
        }
      },
      required: ['approved_by']
    },
    description: 'Approval data',
    examples: {
      example1: {
        summary: 'Approve attendance',
        value: {
          approved_by: 'aff89562-115c-4a4b-99aa-3376ca5b9650'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Attendance record approved successfully',
    type: StuffAttendanceResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: { approved_by: string }
  ): Promise<{
    data: StuffAttendanceResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const response = await this.stuffAttendanceService.approve(id, { approved_by: approveDto.approved_by });
    return {
      data: response,
      status: 'success',
      message: 'Attendance record approved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('report/:userId')
  @ApiOperation({ summary: 'Get monthly attendance report for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'year', required: true, description: 'Year (e.g., 2025)', type: Number })
  @ApiQuery({ name: 'month', required: true, description: 'Month (1-12)', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the monthly attendance report' })
  @ApiResponse({ status: 400, description: 'Invalid year or month' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMonthlyReport(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('year') yearStr: string,
    @Query('month') monthStr: string
  ): Promise<{
    data: {
      totalDays: number,
      presentDays: number,
      absentDays: number,
      lateDays: number,
      onLeaveDays: number,
      totalWorkHours: number,
      totalOvertimeHours: number,
      attendanceRecords: StuffAttendanceResponseDto[]
    };
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    
    if (isNaN(year) || year < 2000 || year > 3000) {
      throw new BadRequestException('Invalid year value');
    }
    
    if (isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid month value (must be 1-12)');
    }
    
    const report = await this.stuffAttendanceService.getMonthlyReport(userId, year, month);
    return {
      data: report,
      status: 'success',
      message: `Attendance report for ${year}-${month} retrieved successfully`,
      statusCode: HttpStatus.OK
    };
  }
}