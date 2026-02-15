import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus
} from '@nestjs/common';
import { DiscountApplicationService } from './provider/discount-application.service';
import { CreateDiscountApplicationDto } from './dto/create-discount-application.dto';
import { UpdateDiscountApplicationDto } from './dto/update-discount-application.dto';
import { DiscountApplicationResponseDto } from './dto/discount-application-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Discount Applications')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('discount-applications')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STUFF, UserRole.BARISTA)
export class DiscountApplicationController {
  constructor(private readonly discountApplicationService: DiscountApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discount application' })
  @ApiResponse({
    status: 201,
    description: 'Discount application created successfully',
    type: DiscountApplicationResponseDto
  })
  async create(
    @Body() createDto: CreateDiscountApplicationDto
  ): Promise<{ data: DiscountApplicationResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const entity = await this.discountApplicationService.create(createDto);
    const dto = new DiscountApplicationResponseDto();
    Object.assign(dto, entity);

    return {
      data: dto,
      status: 'success',
      message: 'Discount application has been created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all discount applications' })
  @ApiResponse({
    status: 200,
    description: 'Return all discount applications',
    type: [DiscountApplicationResponseDto]
  })
  async findAll(): Promise<{
    data: DiscountApplicationResponseDto[];
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const entities = await this.discountApplicationService.findAll();
    const data = entities.map(e => {
      const dto = new DiscountApplicationResponseDto();
      Object.assign(dto, e);
      return dto;
    });

    return {
      data,
      status: 'success',
      message: 'Discount applications retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a discount application by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the discount application',
    type: DiscountApplicationResponseDto
  })
  @ApiResponse({ status: 404, description: 'Discount application not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<{ data: DiscountApplicationResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const entity = await this.discountApplicationService.findOne(id);
    const dto = new DiscountApplicationResponseDto();
    Object.assign(dto, entity);

    return {
      data: dto,
      status: 'success',
      message: 'Discount application retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount application' })
  @ApiResponse({
    status: 200,
    description: 'Discount application updated successfully',
    type: DiscountApplicationResponseDto
  })
  @ApiResponse({ status: 404, description: 'Discount application not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDiscountApplicationDto
  ): Promise<{ data: DiscountApplicationResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    const entity = await this.discountApplicationService.update(id, updateDto);
    const dto = new DiscountApplicationResponseDto();
    Object.assign(dto, entity);

    return {
      data: dto,
      status: 'success',
      message: 'Discount application has been updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount application' })
  @ApiResponse({ status: 200, description: 'Discount application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Discount application not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<{ status: string; message: string; statusCode: HttpStatus }> {
    await this.discountApplicationService.remove(id);
    return {
      status: 'success',
      message: 'Discount application has been deleted successfully.',
      statusCode: HttpStatus.OK
    };
  }
}