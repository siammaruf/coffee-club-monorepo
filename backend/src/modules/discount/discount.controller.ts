import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpStatus, Query } from '@nestjs/common';
import { DiscountService } from './providers/discount.service';
import { BaseDiscountDto } from './dto/base-discount.dto'; 
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountResponseDto } from './dto/discount-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Discounts')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('discounts')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class DiscountController {
    constructor(private readonly discountService: DiscountService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new discount' })
    @ApiResponse({ status: 201, description: 'Discount created successfully', type: DiscountResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid percentage value' })
    async create(@Body() createDiscountDto: BaseDiscountDto): Promise<{ data: DiscountResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.discountService.create(createDiscountDto);
        
        return {
            data: response,
            status: 'success',
            message: 'Discount has been created successfully.',
            statusCode: HttpStatus.CREATED
        };
    }

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.discountService.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) moved to trash.`,
            statusCode: HttpStatus.OK
        };
    }

    @Get('trash/list')
    @ApiOperation({ summary: 'List trashed records' })
    async findTrashed(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ): Promise<any> {
        const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const { data, total } = await this.discountService.findTrashed({ page: pageNumber, limit: limitNumber, search });
        return {
            data,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            status: 'success',
            message: 'Trashed records retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }


    @Get()
    @ApiOperation({ summary: 'Get all discounts' })
    @ApiResponse({
    status: 200,
    description: 'Return all discounts',
    type: [DiscountResponseDto]
    })
    async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
    ): Promise<{
    data: DiscountResponseDto[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    status: string,
    message: string,
    statusCode: HttpStatus
    }> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const { discounts, total } = await this.discountService.findAll(pageNumber, limitNumber, search);
    const totalPages = Math.ceil(total / limitNumber);

    return {
        data: discounts,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        status: 'success',
        message: 'Discounts retrieved successfully.',
        statusCode: HttpStatus.OK
    };
    }

    @Get('not-expired')
    @ApiOperation({ summary: 'Get all not expired discounts' })
    @ApiResponse({ status: 200, description: 'Return all not expired discounts', type: [DiscountResponseDto] })
    async findAllNotExpired(): Promise<{ data: DiscountResponseDto[]; status: string; message: string; statusCode: HttpStatus }> {
        const discounts = await this.discountService.findAllNotExpired();
        return {
            data: discounts,
            status: 'success',
            message: 'Not expired discounts retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a discount by id' })
    @ApiResponse({ status: 200, description: 'Return the discount', type: DiscountResponseDto })
    @ApiResponse({ status: 404, description: 'Discount not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: DiscountResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const discount = await this.discountService.findOne(id);
        
        return {
            data: discount,
            status: 'success',
            message: 'Discount retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get('name/:name')
    @ApiOperation({ summary: 'Get a discount by name' })
    @ApiResponse({ status: 200, description: 'Return the discount', type: DiscountResponseDto })
    @ApiResponse({ status: 404, description: 'Discount not found' })
    async findByName(@Param('name') name: string): Promise<{ data: DiscountResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const discount = await this.discountService.findByName(name);
        
        return {
            data: discount,
            status: 'success',
            message: 'Discount retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a discount' })
    @ApiResponse({ status: 200, description: 'Discount updated successfully', type: DiscountResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid percentage value' })
    @ApiResponse({ status: 404, description: 'Discount not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateDiscountDto: BaseDiscountDto,
    ): Promise<{ data: DiscountResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.discountService.update(id, updateDiscountDto);
        
        return {
            data: response,
            status: 'success',
            message: 'Discount has been updated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a discount' })
    @ApiResponse({ status: 200, description: 'Discount deleted successfully' })
    @ApiResponse({ status: 404, description: 'Discount not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ status: string; message: string; statusCode: HttpStatus }> {
        await this.discountService.remove(id);
        
        return {
            status: 'success',
            message: 'Discount has been deleted successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.discountService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.discountService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
