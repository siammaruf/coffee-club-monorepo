import { Controller, Get, Post, Body, Param, Put, Delete, Patch, HttpCode, HttpStatus, UseInterceptors, UploadedFile, Query, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { ItemService } from "./providers/item.service";
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from "./dto/update-item.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ItemResponseDto } from "./dto/item-response.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Public } from "src/common/decorators/public.decorator";
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Items')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('items')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STUFF, UserRole.BARISTA)
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Delete('bulk/delete')
  @ApiOperation({ summary: 'Bulk soft delete items' })
  async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
    await this.itemService.bulkSoftDelete(body.ids);
    return {
      status: 'success',
      message: `${body.ids.length} record(s) moved to trash.`,
      statusCode: HttpStatus.OK
    };
  }

  @Patch('bulk/restore')
  @ApiOperation({ summary: 'Bulk restore from trash' })
  async bulkRestore(@Body() body: { ids: string[] }): Promise<any> {
    await this.itemService.bulkRestore(body.ids);
    return {
      status: 'success',
      message: `${body.ids.length} record(s) restored.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('bulk/permanent')
  @ApiOperation({ summary: 'Bulk permanent delete' })
  async bulkPermanentDelete(@Body() body: { ids: string[] }): Promise<any> {
    const result = await this.itemService.bulkPermanentDelete(body.ids);
    return {
      data: result,
      status: result.failed.length === 0 ? 'success' : 'partial',
      message: result.failed.length === 0
        ? `${result.deleted.length} record(s) permanently deleted.`
        : `${result.deleted.length} deleted, ${result.failed.length} failed.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('trash/list')
  @ApiOperation({ summary: 'List trashed items' })
  async findTrashed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const { data, total } = await this.itemService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @Public()
  @ApiOperation({ summary: 'Get all items', description: 'Retrieves a list of all items with their categories' })
  @ApiQuery({ name: 'page', description: 'Page number', example: 1, required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', example: 10, required: false })
  @ApiQuery({ name: 'search', description: 'Search term', example: 'espresso', required: false })
  @ApiQuery({ name: 'categorySlug', description: 'Filter by category slug', example: 'beverages', required: false })
  @ApiQuery({ name: 'type', description: 'Filter by item type', example: 'food', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by item status', example: 'available', required: false })
  @ApiResponse({ status: 200, description: 'List of items retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('type') type?: string,
    @Query('status') status?: string
  ): Promise<{
    data: ItemResponseDto[],
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
    const { data, total } = await this.itemService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
      categorySlug,
      type,
      status
    });
    const totalPages = Math.ceil(total / limitNumber);
    const responseData: ItemResponseDto[] = data.map(
      (item) => new ItemResponseDto(item)
    );
  
    return {
      data: responseData,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Products retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID', description: 'Retrieves a single item by its ID' })
  @ApiParam({ name: 'id', description: 'Item ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.itemService.findOne(id);
    const responseData = new ItemResponseDto(item);
    return {
      data: responseData,
      status: 'success',
      message: 'Product retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get item by slug', description: 'Retrieves a single item by its slug' })
  @ApiParam({ name: 'slug', description: 'Item slug', example: 'espresso' })
  @ApiResponse({ status: 200, description: 'Item retrieved successfully' })
  async findBySlug(@Param('slug') slug: string) {
    const item = await this.itemService.findBySlug(slug);
    const responseData = new ItemResponseDto(item);
    return {
      data: responseData,
      status: 'success',
      message: 'Product retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create item', description: 'Creates a new item' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let categories: string[] = [];
    const catVal = createItemDto.categories;
    if (Array.isArray(catVal)) {
      categories = catVal
        .map((cat: unknown) => {
          if (typeof cat === 'string') return cat;
          if (cat && typeof cat === 'object') {
            if ('id' in cat && typeof (cat as { id?: unknown }).id === 'string') {
              return (cat as { id: string }).id;
            }
            if ('name' in cat && typeof (cat as { name?: unknown }).name === 'string') {
              return (cat as { name: string }).name;
            }
          }
          return undefined;
        })
        .filter((c): c is string => typeof c === 'string');
    } else if (typeof catVal === 'string' && catVal) {
      const catStr = String(catVal).trim();
      if (catStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(catStr) as unknown;
          if (Array.isArray(parsed)) {
            categories = (parsed as unknown[]).filter((c): c is string => typeof c === 'string');
          }
        } catch {
          categories = [];
        }
      } else if (catStr.length > 0) {
        categories = [catStr];
      }
    } else {
      categories = [];
    }

    // Parse variations from FormData
    let variations: any[] = [];
    const hasVariations = createItemDto.has_variations === true;
    if (hasVariations) {
      const rawVariations = (createItemDto as any).variations;
      if (Array.isArray(rawVariations)) {
        variations = rawVariations.map((v: any, idx: number) => ({
          id: v.id || undefined,
          name: v.name || '',
          name_bn: v.name_bn || '',
          regular_price: Number(v.regular_price) || 0,
          sale_price: Number(v.sale_price) || 0,
          status: v.status || 'available',
          sort_order: Number(v.sort_order) || idx + 1,
        }));
      } else if (typeof rawVariations === 'string') {
        try {
          const parsed = JSON.parse(rawVariations);
          if (Array.isArray(parsed)) {
            variations = parsed.map((v: any, idx: number) => ({
              id: v.id || undefined,
              name: v.name || '',
              name_bn: v.name_bn || '',
              regular_price: Number(v.regular_price) || 0,
              sale_price: Number(v.sale_price) || 0,
              status: v.status || 'available',
              sort_order: Number(v.sort_order) || idx + 1,
            }));
          }
        } catch { /* ignore */ }
      }
    }

    const transformedDto = {
      ...createItemDto,
      regular_price: Number(createItemDto.regular_price) || 0,
      sale_price: Number(createItemDto.sale_price) || 0,
      has_variations: hasVariations,
      variations,
      categories: categories.map((cat) => ({ id: cat })),
    };

    const item = await this.itemService.createWithImage(transformedDto as CreateItemDto, file);
    const responseData = new ItemResponseDto(item);
    return {
      data: responseData,
      status: 'success',
      message: 'Product created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update item', description: 'Updates an existing item' })
  @ApiParam({ name: 'id', description: 'Item ID', example: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let categories: string[] = [];
    const catVal = updateItemDto.categories;
    if (Array.isArray(catVal)) {
      categories = catVal
        .map((cat: unknown) => {
          if (typeof cat === 'string') return cat;
          if (cat && typeof cat === 'object') {
            if ('id' in cat && typeof (cat as { id?: unknown }).id === 'string') {
              return (cat as { id: string }).id;
            }
            if ('name' in cat && typeof (cat as { name?: unknown }).name === 'string') {
              return (cat as { name: string }).name;
            }
          }
          return undefined;
        })
        .filter((c): c is string => typeof c === 'string');
    } else if (typeof catVal === 'string' && catVal) {
      const catStr = String(catVal).trim();
      if (catStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(catStr) as unknown;
          if (Array.isArray(parsed)) {
            categories = (parsed as unknown[]).filter((c): c is string => typeof c === 'string');
          }
        } catch {
          categories = [];
        }
      } else if (catStr.length > 0) {
        categories = [catStr];
      }
    } else {
      categories = [];
    }

    // Parse variations from FormData
    let variations: any[] = [];
    const hasVariations = updateItemDto.has_variations === true;
    if (hasVariations) {
      const rawVariations = (updateItemDto as any).variations;
      if (Array.isArray(rawVariations)) {
        variations = rawVariations.map((v: any, idx: number) => ({
          id: v.id || undefined,
          name: v.name || '',
          name_bn: v.name_bn || '',
          regular_price: Number(v.regular_price) || 0,
          sale_price: Number(v.sale_price) || 0,
          status: v.status || 'available',
          sort_order: Number(v.sort_order) || idx + 1,
        }));
      } else if (typeof rawVariations === 'string') {
        try {
          const parsed = JSON.parse(rawVariations);
          if (Array.isArray(parsed)) {
            variations = parsed.map((v: any, idx: number) => ({
              id: v.id || undefined,
              name: v.name || '',
              name_bn: v.name_bn || '',
              regular_price: Number(v.regular_price) || 0,
              sale_price: Number(v.sale_price) || 0,
              status: v.status || 'available',
              sort_order: Number(v.sort_order) || idx + 1,
            }));
          }
        } catch { /* ignore */ }
      }
    }

    const transformedDto = {
      ...updateItemDto,
      regular_price: Number(updateItemDto.regular_price) || 0,
      sale_price: Number(updateItemDto.sale_price) || 0,
      has_variations: hasVariations,
      variations,
      categories: categories.map((cat) => ({ id: cat })),
    };

    const item = await this.itemService.updateWithImage(id, transformedDto as UpdateItemDto, file);
    const responseData = new ItemResponseDto(item);
    return {
      data: responseData,
      status: 'success',
      message: 'Product updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload item image', description: 'Upload or update item image' })
  @ApiParam({ name: 'id', description: 'Item ID', example: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }))
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.itemService.uploadItemImage(file);
    await this.itemService.update(id, { image: imageUrl });
    return {
      data: { imageUrl },
      status: 'success',
      message: 'Item image uploaded successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id/remove-image')
  @ApiOperation({ summary: 'Remove item image', description: 'Remove item image' })
  @ApiParam({ name: 'id', description: 'Item ID', example: 'uuid' })
  async removeImage(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.itemService.findOne(id);
    if (item.image) {
      await this.itemService.removeItemImage(item.image);
      await this.itemService.update(id, { image: undefined });
    }
    return {
      status: 'success',
      message: 'Item image removed successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete item', description: 'Deletes an item by its ID' })
  @ApiParam({ name: 'id', description: 'Item ID', example: 'uuid' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.itemService.remove(id);
    return {
      status: 'success',
      message: 'Product deleted successfully.',
      statusCode: HttpStatus.NO_CONTENT
    };
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore item from trash' })
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    await this.itemService.restore(id);
    return {
      status: 'success',
      message: 'Record restored successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete item' })
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    await this.itemService.permanentDelete(id);
    return {
      status: 'success',
      message: 'Record permanently deleted.',
      statusCode: HttpStatus.OK
    };
  }
}