import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create blog post', description: 'Creates a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully' })
  async create(@Body() dto: CreateBlogPostDto) {
    const post = await this.blogService.create(dto);
    return {
      data: post,
      status: 'success',
      message: 'Blog post created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all blog posts', description: 'Retrieves a paginated list of all blog posts' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Blog posts retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.blogService.findAll({
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
      message: 'Blog posts retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog post by ID', description: 'Retrieves a single blog post by ID' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const post = await this.blogService.findOne(id);
    return {
      data: post,
      status: 'success',
      message: 'Blog post retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update blog post', description: 'Updates an existing blog post' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    const post = await this.blogService.update(id, dto);
    return {
      data: post,
      status: 'success',
      message: 'Blog post updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog post', description: 'Deletes a blog post by ID' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.remove(id);
    return {
      status: 'success',
      message: 'Blog post deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}
