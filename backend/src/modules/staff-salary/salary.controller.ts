import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, ParseUUIDPipe, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SalaryService } from './providers/salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Salary } from './entities/salary.entity';
import { receiptStorage } from 'src/common/utils/storage.util';
import { SalaryResponseDto } from './dto/salary-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('Staff Salary')
@Controller('staff-salary')
@Roles(UserRole.ADMIN)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new salary record',
    description: 'Create a new salary record for an employee with optional receipt image upload'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { 
          type: 'string', 
          format: 'uuid', 
          description: 'User ID',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        month: { 
          type: 'string', 
          format: 'date', 
          description: 'Salary month (YYYY-MM-DD format)',
          example: '2025-06-01'
        },
        base_salary: { 
          type: 'number', 
          description: 'Base salary amount',
          example: 50000
        },
        bonus: { 
          type: 'number', 
          description: 'Bonus amount',
          example: 5000,
        },
        deduction: { 
          type: 'number', 
          description: 'Deduction amount',
          example: 2000,
        },
        total_payble: { 
          type: 'number', 
          description: 'Total payable amount',
          example: 53000
        },
        receipt_image: { 
          type: 'string', 
          format: 'binary', 
          description: 'Bank receipt image file',
        },
        is_paid: { 
          type: 'boolean', 
          description: 'Payment status', 
          default: false,
          example: false,
        }
      },
      required: ['user_id', 'month', 'base_salary', 'total_payble']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Salary record created successfully',
    schema: {
      example: {
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174001",
          month: "2025-06-01T00:00:00.000Z",
          base_salary: 50000,
          bonus: 5000,
          deduction: 2000,
          total_payble: 53000,
          receipt_image: "uploads/receipts/receipt_123456789.jpg",
          is_paid: false,
          created_at: "2025-06-30T12:00:00.000Z",
          updated_at: "2025-06-30T12:00:00.000Z"
        },
        status: "success",
        message: "Salary record created successfully",
        statusCode: 201
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Salary record already exists for this month' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'receipt_image', maxCount: 1 }
  ], { storage: receiptStorage }))
  async create(
    @Body() createSalaryDto: CreateSalaryDto,
    @UploadedFiles() files: { 
      receipt_image?: Express.Multer.File[]
    }
  ): Promise<{
    data: Salary;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (files?.receipt_image?.[0]?.path) {
      createSalaryDto.receipt_image = files.receipt_image[0].path.replace(/\\/g, '/');
    }
    
    const salary = await this.salaryService.create(createSalaryDto);
    return {
      data: salary,
      status: 'success',
      message: 'Salary record created successfully',
      statusCode: HttpStatus.CREATED
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all salary records with optional filtering',
    description: 'Retrieve a paginated list of salary records with optional filters for user, payment status, and date range'
  })
  @ApiQuery({ 
    name: 'user_id', 
    required: false, 
    type: String, 
    description: 'Filter by user ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'is_paid', 
    required: false, 
    type: Boolean, 
    description: 'Filter by payment status (true/false)',
    example: true
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    type: String, 
    description: 'Filter by start date (YYYY-MM-DD format)',
    example: '2025-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    type: String, 
    description: 'Filter by end date (YYYY-MM-DD format)',
    example: '2025-12-31'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Items per page (default: 10)',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a paginated list of salary records',
    schema: {
      example: {
        data: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            user_id: "123e4567-e89b-12d3-a456-426614174001",
            month: "2025-06-01T00:00:00.000Z",
            base_salary: 50000,
            bonus: 5000,
            deduction: 2000,
            total_payble: 53000,
            receipt_image: "uploads/receipts/receipt_123456789.jpg",
            is_paid: true,
            created_at: "2025-06-30T10:00:00.000Z",
            updated_at: "2025-06-30T12:00:00.000Z"
          }
        ],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
        status: "success",
        message: "Salary records retrieved successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid query parameters' })
  async findAll(
    @Query('user_id') user_id?: string,
    @Query('is_paid') is_paid?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{
    data: SalaryResponseDto[];
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
    let isPaidBoolean: boolean | undefined;
    
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
    
    if (is_paid !== undefined) {
      isPaidBoolean = is_paid === 'true';
    }
    
    const { data, total, totalPages } = await this.salaryService.findAll({
      user_id,
      isPaid: isPaidBoolean,
      startDate: startDateObj,
      endDate: endDateObj,
      page: pageNumber,
      limit: limitNumber
    });
    
    return {
      data: data.map(salary => new SalaryResponseDto(salary)),
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Salary records retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get salary record by ID',
    description: 'Retrieve a specific salary record by its unique identifier'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    format: 'uuid', 
    description: 'Salary record unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the salary record',
    schema: {
      example: {
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174001",
          month: "2025-06-01T00:00:00.000Z",
          base_salary: 50000,
          bonus: 5000,
          deduction: 2000,
          total_payble: 53000,
          receipt_image: "uploads/receipts/receipt_123456789.jpg",
          is_paid: true,
          created_at: "2025-06-30T10:00:00.000Z",
          updated_at: "2025-06-30T12:00:00.000Z"
        },
        status: "success",
        message: "Salary record retrieved successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid UUID format' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    data: SalaryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const salary = await this.salaryService.findOne(id);
    return {
      data: new SalaryResponseDto(salary),
      status: 'success',
      message: 'Salary record retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update a salary record',
    description: 'Update an existing salary record with new information and optional receipt image'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    format: 'uuid', 
    description: 'Salary record unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        month: { 
          type: 'string', 
          format: 'date', 
          description: 'Salary month (YYYY-MM-DD format)',
          example: '2025-06-01'
        },
        base_salary: { 
          type: 'number', 
          description: 'Base salary amount',
          example: 55000
        },
        bonus: { 
          type: 'number', 
          description: 'Bonus amount',
          example: 6000
        },
        deduction: { 
          type: 'number', 
          description: 'Deduction amount',
          example: 2500,
        },
        total_payble: { 
          type: 'number', 
          description: 'Total payable amount',
          example: 58500,
        },
        receipt_image: { 
          type: 'string', 
          format: 'binary', 
          description: 'Bank receipt image file',
        },
        is_paid: { 
          type: 'boolean', 
          description: 'Payment status',
          example: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Salary record updated successfully',
    schema: {
      example: {
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174001",
          month: "2025-06-01T00:00:00.000Z",
          base_salary: 55000,
          bonus: 6000,
          deduction: 2500,
          total_payble: 58500,
          receipt_image: "uploads/receipts/receipt_updated_123456789.jpg",
          is_paid: true,
          created_at: "2025-06-30T12:00:00.000Z",
          updated_at: "2025-06-30T15:00:00.000Z"
        },
        status: "success",
        message: "Salary record updated successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data or UUID format' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'receipt_image', maxCount: 1 }
  ], { storage: receiptStorage }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
    @UploadedFiles() files?: { 
      receipt_image?: Express.Multer.File[]
    }
  ): Promise<{
    data: SalaryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (files?.receipt_image?.[0]?.path) {
      console.log('Receipt image stored at:', files.receipt_image[0].path);
      updateSalaryDto.receipt_image = files.receipt_image[0].path.replace(/\\/g, '/');
    }
    
    const salary = await this.salaryService.update(id, updateSalaryDto);
    return {
      data: new SalaryResponseDto(salary),
      status: 'success',
      message: 'Salary record updated successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Post(':id/mark-as-paid')
  @ApiOperation({ 
    summary: 'Mark a salary as paid',
    description: 'Update the payment status of a salary record to paid with optional receipt image. Payment date will be tracked by created_at timestamp.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    format: 'uuid', 
    description: 'Salary record unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receipt_image: { 
          type: 'string', 
          format: 'binary',
          description: 'Bank receipt image file (optional)',
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Salary marked as paid successfully',
    schema: {
      example: {
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174001",
          month: "2025-06-01T00:00:00.000Z",
          base_salary: 50000,
          bonus: 5000,
          deduction: 2000,
          total_payble: 53000,
          receipt_image: "uploads/receipts/payment_receipt_123456789.jpg",
          is_paid: true,
          created_at: "2025-06-30T12:00:00.000Z",
          updated_at: "2025-06-30T16:00:00.000Z"
        },
        status: "success",
        message: "Salary marked as paid successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Salary already marked as paid' })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'receipt_image', maxCount: 1 }
  ], { storage: receiptStorage }))
  async markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files?: { 
      receipt_image?: Express.Multer.File[]
    }
  ): Promise<{
    data: SalaryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const salary = await this.salaryService.markAsPaid(id, {
      receipt_image: files?.receipt_image?.[0]?.path?.replace(/\\/g, '/') || undefined
    });
    
    return {
      data: new SalaryResponseDto(salary),
      status: 'success',
      message: 'Salary marked as paid successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Post(':id/mark-as-unpaid')
  @ApiOperation({ 
    summary: 'Mark a salary as unpaid',
    description: 'Revert the payment status of a salary record back to unpaid'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    format: 'uuid', 
    description: 'Salary record unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Salary marked as unpaid successfully',
    schema: {
      example: {
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174001",
          month: "2025-06-01T00:00:00.000Z",
          base_salary: 50000,
          bonus: 5000,
          deduction: 2000,
          total_payble: 53000,
          receipt_image: null,
          is_paid: false,
          created_at: "2025-06-30T12:00:00.000Z",
          updated_at: "2025-06-30T17:00:00.000Z"
        },
        status: "success",
        message: "Salary marked as unpaid successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Salary already marked as unpaid' })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  async markAsUnpaid(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<{
    data: SalaryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const salary = await this.salaryService.markAsUnpaid(id);
    return {
      data: new SalaryResponseDto(salary),
      status: 'success',
      message: 'Salary marked as unpaid successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('user/:userId/history')
  @ApiOperation({ 
    summary: 'Get salary history for a specific user',
    description: 'Retrieve the complete salary history for a user with optional year filtering'
  })
  @ApiParam({ 
    name: 'userId', 
    type: String, 
    format: 'uuid', 
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @ApiQuery({ 
    name: 'year', 
    required: false, 
    type: Number, 
    description: 'Filter by specific year (e.g., 2025). If not provided, returns all years',
    example: 2025
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user salary history',
    schema: {
      example: {
        data: [
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            user_id: "123e4567-e89b-12d3-a456-426614174001",
            month: "2025-01-01T00:00:00.000Z",
            base_salary: 45000,
            bonus: 3000,
            deduction: 1500,
            total_payble: 46500,
            receipt_image: "uploads/receipts/jan_receipt.jpg",
            is_paid: true,
            created_at: "2025-01-30T12:00:00.000Z",
            updated_at: "2025-01-31T10:00:00.000Z"
          },
          {
            id: "123e4567-e89b-12d3-a456-426614174002",
            user_id: "123e4567-e89b-12d3-a456-426614174001",
            month: "2025-02-01T00:00:00.000Z",
            base_salary: 45000,
            bonus: 4000,
            deduction: 1500,
            total_payble: 47500,
            receipt_image: "uploads/receipts/feb_receipt.jpg",
            is_paid: true,
            created_at: "2025-02-28T12:00:00.000Z",
            updated_at: "2025-02-28T10:00:00.000Z"
          }
        ],
        status: "success",
        message: "User salary history retrieved successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid user ID or year value' })
  async getUserSalaryHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('year') year?: string
  ): Promise<{
    data: SalaryResponseDto[];
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    
    if (yearNumber && (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 3000)) {
      throw new BadRequestException('Invalid year value. Year must be between 2000 and 3000');
    }
    
    const salaries = await this.salaryService.getUserSalaryHistory(userId, yearNumber);
    return {
      data: salaries.map(salary => new SalaryResponseDto(salary)),
      status: 'success',
      message: 'User salary history retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a salary record',
    description: 'Permanently delete a salary record from the system. This action cannot be undone.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    format: 'uuid', 
    description: 'Salary record unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Salary record deleted successfully',
    schema: {
      example: {
        status: "success",
        message: "Salary record deleted successfully",
        statusCode: 200
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Salary record not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid UUID format' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    await this.salaryService.remove(id);
    return {
      status: 'success',
      message: 'Salary record deleted successfully',
      statusCode: HttpStatus.OK
    };
  }
}