import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './providers/public.service';
import { Public } from '../../common/decorators/public.decorator';
import { ItemResponseDto } from '../items/dto/item-response.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List all categories', description: 'Retrieves a paginated list of all menu categories' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.publicService.getCategories({
      page: pageNumber,
      limit: limitNumber,
      search,
    });

    const totalPages = Math.ceil(result.total / limitNumber);

    return {
      data: result.data,
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Categories retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Public()
  @Get('items')
  @ApiOperation({ summary: 'List available items', description: 'Retrieves available menu items with category filter, search, and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'categorySlug', required: false, description: 'Filter by category slug' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully' })
  async getItems(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categorySlug') categorySlug?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.publicService.getItems({
      page: pageNumber,
      limit: limitNumber,
      search,
      categorySlug,
    });

    const responseData: ItemResponseDto[] = result.data.map(
      (item) => new ItemResponseDto(item),
    );

    const totalPages = Math.ceil(result.total / limitNumber);

    return {
      data: responseData,
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Items retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Public()
  @Get('items/:id')
  @ApiOperation({ summary: 'Get single item', description: 'Retrieves a single item with category details' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
  async getItem(@Param('id') id: string) {
    const item = await this.publicService.getItem(id);
    const responseData = new ItemResponseDto(item);

    return {
      data: responseData,
      status: 'success',
      message: 'Item retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Public()
  @Get('tables')
  @ApiOperation({ summary: 'List available tables', description: 'Retrieves available tables for dine-in reservation' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
  async getAvailableTables() {
    const tables = await this.publicService.getAvailableTables();

    return {
      data: tables,
      status: 'success',
      message: 'Available tables retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}
