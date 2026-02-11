import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpStatus, Query } from '@nestjs/common';
import { CategoryService } from './providers/category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBasicAuth } from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
@ApiBasicAuth()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryResponseDto })
    async create(
        @Body() createCategoryDto: CreateCategoryDto
    ): Promise<{ data: CategoryResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.categoryService.create(createCategoryDto);
        return {
            data: response,
            status: 'success',
            message: 'Category has been created successfully.',
            statusCode: HttpStatus.CREATED
        };
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all categories' })
    @ApiResponse({ status: 200, description: 'Return all categories', type: [CategoryResponseDto] })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string
    ): Promise<{
        data: CategoryResponseDto[],
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
        const { data, total } = await this.categoryService.findAll({ page: pageNumber, limit: limitNumber, search });
        const totalPages = Math.ceil(total / limitNumber);
        const responseData: CategoryResponseDto[] = data.map(
            (category: Partial<CategoryResponseDto>) => new CategoryResponseDto(category)
        );

        return {
            data: responseData,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages,
            status: 'success',
            message: 'Categories retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a category by id' })
    @ApiResponse({ status: 200, description: 'Return the category', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: CategoryResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const category = await this.categoryService.findOne(id);
        return {
            data: category,
            status: 'success',
            message: 'Category retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get a category by slug' })
    @ApiResponse({ status: 200, description: 'Return the category', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findBySlug(@Param('slug') slug: string): Promise<{ data: CategoryResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const category = await this.categoryService.findBySlug(slug);
        return {
            data: category,
            status: 'success',
            message: 'Category retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a category' })
    @ApiResponse({ status: 200, description: 'Category updated successfully', type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ): Promise<{ data: CategoryResponseDto; status: string; message: string; statusCode: HttpStatus }> {
        const response = await this.categoryService.update(id, updateCategoryDto);
        return {
            data: response,
            status: 'success',
            message: 'Category has been updated successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ status: string; message: string; statusCode: HttpStatus }> {
        await this.categoryService.remove(id);
        return {
            status: 'success',
            message: 'Category has been deleted successfully.',
            statusCode: HttpStatus.OK
        };
    }
}