import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, Query, UseInterceptors, UploadedFile, Patch, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { KitchenItemService } from './providers/kitchen-item.service';
import { CreateKitchenItemDto } from './dto/create-kitchen-item.dto';
import { UpdateKitchenItemDto } from './dto/update-kitchen-item.dto';
import { KitchenResponseDto } from './dto/kitchen-response-item.dto';
import { KitchenItemType } from './enum/kitchen-item-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Kitchen Items')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('kitchen-items')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF)
export class KitchenItemController {
  constructor(private readonly kitchenItemService: KitchenItemService) {}

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.kitchenItemService.bulkSoftDelete(body.ids);
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
        const { data, total } = await this.kitchenItemService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @ApiOperation({ summary: 'Get all kitchen items with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'type', enum: KitchenItemType, enumName: 'KitchenItemType', required: false, description: 'Filter by kitchen item type' })
  @ApiResponse({ status: 200, description: 'List of kitchen items retrieved successfully' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('type') type?: KitchenItemType
  ): Promise<{
    data: KitchenResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    
    const { data: responseData, total } = await this.kitchenItemService.findAll(
      pageNumber,
      limitNumber,
      type
    );
    
    const totalPages = Math.ceil(total / limitNumber);
    
    return {
      data: responseData,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Kitchen items retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kitchen item by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen item ID' })
  @ApiResponse({ status: 200, description: 'Kitchen item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen item not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.kitchenItemService.findOne(id);
    
    return {
      data,
      status: 'success',
      message: 'Kitchen item retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new kitchen item' })
  @ApiResponse({ status: 201, description: 'Kitchen item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  }))
  async create(
    @Body() createKitchenItemDto: CreateKitchenItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let response: CreateKitchenItemDto;

    if(file){
      response = await this.kitchenItemService.createWithPicture(createKitchenItemDto, file);  
    }else{
      response = await this.kitchenItemService.create(createKitchenItemDto);
    }
    
    return {
      data: response,
      status: 'success',
      message: 'Kitchen item created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update kitchen item by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen item ID' })
  @ApiResponse({ status: 200, description: 'Kitchen item updated successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen item not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKitchenItemDto: UpdateKitchenItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let data;
    if (file) {
      data = await this.kitchenItemService.updateWithPicture(id, updateKitchenItemDto, file);
    } else {
      data = await this.kitchenItemService.update(id, updateKitchenItemDto);
    }

    return {
      data,
      status: 'success',
      message: 'Kitchen item updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete kitchen item by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen item ID' })
  @ApiResponse({ status: 204, description: 'Kitchen item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen item not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.kitchenItemService.remove(id);
    
    return {
      data: null,
      status: 'success',
      message: 'Kitchen item deleted successfully.',
      statusCode: HttpStatus.NO_CONTENT
    };
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.kitchenItemService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.kitchenItemService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
