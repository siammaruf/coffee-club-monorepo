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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { WebsiteContentService } from './website-content.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { CreateAdvantageDto } from './dto/create-advantage.dto';
import { UpdateAdvantageDto } from './dto/update-advantage.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Website Content')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('website-content')
export class WebsiteContentController {
  constructor(
    private readonly websiteContentService: WebsiteContentService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // =====================
  // Hero Slides
  // =====================

  @Get('hero-slides')
  @ApiOperation({ summary: 'List all hero slides', description: 'Retrieves a paginated list of all hero slides' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or description' })
  @ApiResponse({ status: 200, description: 'Hero slides retrieved successfully' })
  async findAllHeroSlides(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.websiteContentService.findAllHeroSlides({
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
      message: 'Hero slides retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('hero-slides')
  @ApiOperation({ summary: 'Create hero slide', description: 'Creates a new hero slide' })
  @ApiResponse({ status: 201, description: 'Hero slide created successfully' })
  async createHeroSlide(@Body() dto: CreateHeroSlideDto) {
    const slide = await this.websiteContentService.createHeroSlide(dto);
    return {
      data: slide,
      status: 'success',
      message: 'Hero slide created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put('hero-slides/:id')
  @ApiOperation({ summary: 'Update hero slide', description: 'Updates an existing hero slide' })
  @ApiParam({ name: 'id', description: 'Hero slide ID' })
  @ApiResponse({ status: 200, description: 'Hero slide updated successfully' })
  async updateHeroSlide(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroSlideDto,
  ) {
    const slide = await this.websiteContentService.updateHeroSlide(id, dto);
    return {
      data: slide,
      status: 'success',
      message: 'Hero slide updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('hero-slides/:id')
  @ApiOperation({ summary: 'Delete hero slide', description: 'Deletes a hero slide by ID' })
  @ApiParam({ name: 'id', description: 'Hero slide ID' })
  @ApiResponse({ status: 200, description: 'Hero slide deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async removeHeroSlide(@Param('id', ParseUUIDPipe) id: string) {
    await this.websiteContentService.removeHeroSlide(id);
    return {
      status: 'success',
      message: 'Hero slide deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  // =====================
  // Advantages
  // =====================

  @Get('advantages')
  @ApiOperation({ summary: 'List all advantages', description: 'Retrieves a paginated list of all advantages' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or description' })
  @ApiResponse({ status: 200, description: 'Advantages retrieved successfully' })
  async findAllAdvantages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.websiteContentService.findAllAdvantages({
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
      message: 'Advantages retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('advantages')
  @ApiOperation({ summary: 'Create advantage', description: 'Creates a new advantage' })
  @ApiResponse({ status: 201, description: 'Advantage created successfully' })
  async createAdvantage(@Body() dto: CreateAdvantageDto) {
    const advantage = await this.websiteContentService.createAdvantage(dto);
    return {
      data: advantage,
      status: 'success',
      message: 'Advantage created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put('advantages/:id')
  @ApiOperation({ summary: 'Update advantage', description: 'Updates an existing advantage' })
  @ApiParam({ name: 'id', description: 'Advantage ID' })
  @ApiResponse({ status: 200, description: 'Advantage updated successfully' })
  async updateAdvantage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdvantageDto,
  ) {
    const advantage = await this.websiteContentService.updateAdvantage(id, dto);
    return {
      data: advantage,
      status: 'success',
      message: 'Advantage updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('advantages/:id')
  @ApiOperation({ summary: 'Delete advantage', description: 'Deletes an advantage by ID' })
  @ApiParam({ name: 'id', description: 'Advantage ID' })
  @ApiResponse({ status: 200, description: 'Advantage deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async removeAdvantage(@Param('id', ParseUUIDPipe) id: string) {
    await this.websiteContentService.removeAdvantage(id);
    return {
      status: 'success',
      message: 'Advantage deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  // =====================
  // Testimonials
  // =====================

  @Get('testimonials')
  @ApiOperation({ summary: 'List all testimonials', description: 'Retrieves a paginated list of all testimonials' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or quote' })
  @ApiResponse({ status: 200, description: 'Testimonials retrieved successfully' })
  async findAllTestimonials(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.websiteContentService.findAllTestimonials({
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
      message: 'Testimonials retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('testimonials')
  @ApiOperation({ summary: 'Create testimonial', description: 'Creates a new testimonial' })
  @ApiResponse({ status: 201, description: 'Testimonial created successfully' })
  async createTestimonial(@Body() dto: CreateTestimonialDto) {
    const testimonial = await this.websiteContentService.createTestimonial(dto);
    return {
      data: testimonial,
      status: 'success',
      message: 'Testimonial created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put('testimonials/:id')
  @ApiOperation({ summary: 'Update testimonial', description: 'Updates an existing testimonial' })
  @ApiParam({ name: 'id', description: 'Testimonial ID' })
  @ApiResponse({ status: 200, description: 'Testimonial updated successfully' })
  async updateTestimonial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    const testimonial = await this.websiteContentService.updateTestimonial(id, dto);
    return {
      data: testimonial,
      status: 'success',
      message: 'Testimonial updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('testimonials/:id')
  @ApiOperation({ summary: 'Delete testimonial', description: 'Deletes a testimonial by ID' })
  @ApiParam({ name: 'id', description: 'Testimonial ID' })
  @ApiResponse({ status: 200, description: 'Testimonial deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async removeTestimonial(@Param('id', ParseUUIDPipe) id: string) {
    await this.websiteContentService.removeTestimonial(id);
    return {
      status: 'success',
      message: 'Testimonial deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  // =====================
  // Website Settings
  // =====================

  @Get('settings')
  @ApiOperation({ summary: 'Get website settings', description: 'Retrieves all website-related settings' })
  @ApiResponse({ status: 200, description: 'Website settings retrieved successfully' })
  async getSettings() {
    const settings = await this.websiteContentService.getWebsiteSettings();
    return {
      data: settings,
      status: 'success',
      message: 'Website settings retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update website settings', description: 'Bulk update website-related settings' })
  @ApiResponse({ status: 200, description: 'Website settings updated successfully' })
  async updateSettings(@Body() data: Record<string, string>) {
    const settings = await this.websiteContentService.updateWebsiteSettings(data);
    return {
      data: settings,
      status: 'success',
      message: 'Website settings updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  // =====================
  // Image Upload
  // =====================

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload website content image', description: 'Upload an image for website content (hero slides, advantages, testimonials)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file, {
      folder: 'coffee-club/website-content',
    });
    return {
      data: { imageUrl: result.secure_url },
      status: 'success',
      message: 'Image uploaded successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}
