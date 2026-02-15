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
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Blog')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
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

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.blogService.bulkSoftDelete(body.ids);
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
        const { data, total } = await this.blogService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.blogService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.blogService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
