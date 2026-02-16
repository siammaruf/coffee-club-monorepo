import { Controller, Get, Post, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './providers/public.service';
import { Public } from '../../common/decorators/public.decorator';
import { ItemResponseDto } from '../items/dto/item-response.dto';
import { CreateReservationDto } from '../reservations/dto/create-reservation.dto';
import { CreateContactMessageDto } from '../contact-messages/dto/create-contact-message.dto';

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
  @Get('items/by-slug/:slug')
  @ApiOperation({ summary: 'Get single item by slug', description: 'Retrieves a single item by its URL slug' })
  @ApiParam({ name: 'slug', description: 'Item slug' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
  async getItemBySlug(@Param('slug') slug: string) {
    const item = await this.publicService.getItemBySlug(slug);
    const responseData = new ItemResponseDto(item);

    return {
      data: responseData,
      status: 'success',
      message: 'Item retrieved successfully.',
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

  // Blog public endpoints

  @Public()
  @Get('blog')
  @ApiOperation({ summary: 'List published blog posts', description: 'Retrieves a paginated list of published blog posts' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Blog posts retrieved successfully' })
  async getPublishedBlogPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.publicService.getPublishedBlogPosts({
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

  @Public()
  @Get('blog/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug', description: 'Retrieves a single published blog post by slug' })
  @ApiParam({ name: 'slug', description: 'Blog post slug' })
  @ApiResponse({ status: 200, description: 'Blog post retrieved successfully' })
  async getPublishedBlogPost(@Param('slug') slug: string) {
    const post = await this.publicService.getPublishedBlogPostBySlug(slug);
    return {
      data: post,
      status: 'success',
      message: 'Blog post retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  // Settings public endpoints

  @Public()
  @Get('settings/reservations')
  @ApiOperation({
    summary: 'Check reservation status',
    description: 'Returns whether the reservation system is currently enabled or disabled',
  })
  @ApiResponse({ status: 200, description: 'Reservation status retrieved successfully' })
  async getReservationStatus() {
    const enabled = await this.publicService.isReservationEnabled();
    return {
      data: { enabled },
      status: 'success',
      message: 'Reservation status retrieved.',
      statusCode: HttpStatus.OK,
    };
  }

  // Reservations public endpoint

  @Public()
  @Post('reservations')
  @ApiOperation({ summary: 'Create a reservation', description: 'Creates a new reservation (no auth required)' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  @ApiResponse({ status: 400, description: 'Reservations are currently disabled' })
  async createReservation(@Body() dto: CreateReservationDto) {
    const reservation = await this.publicService.createReservation(dto);
    return {
      data: reservation,
      status: 'success',
      message: 'Reservation created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  // Website Content public endpoint

  @Public()
  @Get('website-content')
  @ApiOperation({ summary: 'Get all website content for frontend', description: 'Retrieves all active website content including hero slides, advantages, testimonials, and settings' })
  @ApiResponse({ status: 200, description: 'Website content retrieved successfully' })
  async getWebsiteContent() {
    const content = await this.publicService.getWebsiteContent();
    return {
      data: content,
      status: 'success',
      message: 'Website content retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  // Contact form public endpoint

  @Public()
  @Post('contact')
  @ApiOperation({ summary: 'Submit contact form', description: 'Submits a new contact message (no auth required)' })
  @ApiResponse({ status: 201, description: 'Contact message submitted successfully' })
  async submitContactMessage(@Body() dto: CreateContactMessageDto) {
    const message = await this.publicService.submitContactMessage(dto);
    return {
      data: message,
      status: 'success',
      message: 'Contact message submitted successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  // Partners public endpoint

  @Public()
  @Get('partners')
  @ApiOperation({ summary: 'List active partners', description: 'Retrieves all active partners sorted by display order' })
  @ApiResponse({ status: 200, description: 'Partners retrieved successfully' })
  async getActivePartners() {
    const partners = await this.publicService.getActivePartners();
    return {
      data: partners,
      status: 'success',
      message: 'Partners retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}
