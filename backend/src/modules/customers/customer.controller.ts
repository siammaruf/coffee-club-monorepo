import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CustomerService } from './providers/customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('Customers')
@Controller('customers')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new customer' })
    @ApiResponse({ status: 201, description: 'Customer created successfully', type: CustomerResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('picture'))
    async create(
        @Body() createCustomerDto: CreateCustomerDto,
        @UploadedFile() file?: Express.Multer.File
    ): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        let response: CustomerResponseDto;
        
        if (file) {
            response = await this.customerService.createWithPicture(createCustomerDto, file);
        } else {
            response = await this.customerService.create(createCustomerDto);
        }
        
        return {
            data: response,
            status: 'success',
            message: 'Customer has been created successfully.',
            statusCode: HttpStatus.CREATED
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all customers' })
    @ApiResponse({ status: 200, description: 'List of all customers', type: [CustomerResponseDto] })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('is_active') is_active?: string
    ): Promise<{
        data: CustomerResponseDto[],
        total: number,
        page: number,
        limit: number,
        totalPages: number,
        status: string,
        message: string,
        statusCode: HttpStatus
    }> {
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        const isActiveFilter = is_active !== undefined ? is_active === 'true' : undefined;
        
        const result = await this.customerService.findAll({
            page: pageNum,
            limit: limitNum,
            search,
            is_active: isActiveFilter
        });
        
        return {
            data: result.data,
            total: result.total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(result.total / limitNum),
            status: 'success',
            message: 'Customers retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a customer by id' })
    @ApiResponse({ status: 200, description: 'Customer found', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.customerService.findOne(id);
        return {
            data: response,
            status: 'success',
            message: 'Customer retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Get a customer by email' })
    @ApiResponse({ status: 200, description: 'Customer found', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async findByEmail(@Param('email') email: string): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.customerService.findByEmail(email);
        return {
            data: response,
            status: 'success',
            message: 'Customer retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a customer' })
    @ApiResponse({ status: 200, description: 'Customer updated successfully', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('picture'))
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
        @UploadedFile() file?: Express.Multer.File
    ): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.customerService.updateCustomerWithPicture(id, updateCustomerDto, file);
        return {
            data: response,
            status: 'success',
            message: 'Customer has been updated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Post(':id/upload-picture')
    @ApiOperation({ summary: 'Upload customer picture' })
    @ApiResponse({ status: 200, description: 'Picture uploaded successfully', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('picture'))
    async uploadPicture(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File
    ): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.customerService.uploadCustomerPicture(id, file);
        return {
            data: response,
            status: 'success',
            message: 'Customer picture uploaded successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/picture')
    @ApiOperation({ summary: 'Remove customer picture' })
    @ApiResponse({ status: 200, description: 'Picture removed successfully', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found or no picture to remove' })
    async removePicture(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.customerService.removeCustomerPicture(id);
        return {
            data: response,
            status: 'success',
            message: 'Customer picture removed successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a customer' })
    @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ status: string; message: string; statusCode: HttpStatus }> {
        await this.customerService.remove(id);
        return {
            status: 'success',
            message: 'Customer has been deleted successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Post(':id/redeem-points')
    @ApiOperation({ summary: 'Redeem customer points for balance' })
    @ApiResponse({ status: 200, description: 'Points redeemed successfully' })
    @ApiResponse({ status: 400, description: 'Insufficient points or invalid amount' })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async redeemPoints(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { amount: number }
    ): Promise<{ data: any; status: string; message: string; statusCode: HttpStatus }> {
        const result = await this.customerService.redeemPoints(id, body.amount);
        return {
            data: result,
            status: 'success',
            message: `Successfully redeemed ${body.amount} Taka from points.`,
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id/balance')
    @ApiOperation({ summary: 'Get customer points and balance' })
    @ApiResponse({ status: 200, description: 'Customer balance retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async getCustomerBalance(
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<{ data: any; status: string; message: string; statusCode: HttpStatus }> {
        const balance = await this.customerService.getCustomerBalance(id);
        return {
            data: balance,
            status: 'success',
            message: 'Customer balance retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id/can-redeem/:amount')
    @ApiOperation({ summary: 'Check if customer can redeem specified amount' })
    @ApiResponse({ status: 200, description: 'Redemption eligibility checked' })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async canRedeem(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('amount') amount: string
    ): Promise<{ data: any; status: string; message: string; statusCode: HttpStatus }> {
        const canRedeem = await this.customerService.canRedeem(id, parseFloat(amount));
        return {
            data: { canRedeem, amount: parseFloat(amount) },
            status: 'success',
            message: canRedeem ? 'Customer can redeem this amount.' : 'Customer cannot redeem this amount.',
            statusCode: HttpStatus.OK
        };
    }

    @Post(':id/add-points')
    @ApiOperation({ summary: 'Add points to customer from order' })
    @ApiResponse({ status: 200, description: 'Points added successfully' })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async addPointsFromOrder(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { orderAmount: number }
    ): Promise<{ data: any; status: string; message: string; statusCode: HttpStatus }> {
        const result = await this.customerService.addPointsFromOrder(id, body.orderAmount);
        return {
            data: result,
            status: 'success',
            message: `Points added successfully from order.`,
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activate a customer' })
    @ApiResponse({ status: 200, description: 'Customer activated successfully', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async activateCustomer(
    @Param('id', ParseUUIDPipe) id: string
    ): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const customer = await this.customerService.activateCustomer(id);
        return {
            data: customer,
            status: 'success',
            message: 'Customer has been activated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Deactivate a customer' })
    @ApiResponse({ status: 200, description: 'Customer deactivated successfully', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async deactivateCustomer(
    @Param('id', ParseUUIDPipe) id: string
    ): Promise<{ data: CustomerResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const customer = await this.customerService.deactivateCustomer(id);
        return {
            data: customer,
            status: 'success',
            message: 'Customer has been deactivated successfully.',
            statusCode: HttpStatus.OK
        };
    }
}
