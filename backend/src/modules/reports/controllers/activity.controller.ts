import { Controller, Get, Post, Body, Query, Param, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { ActivityService } from '../providers/activity.service';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { ActivityResponseDto } from '../dto/activity-response.dto';
import { ActivityType } from '../entities/activity.entity';

@ApiTags('Activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new activity' })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({
    status: 201,
    description: 'Activity logged successfully',
    type: ActivityResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  async logActivity(@Body() createActivityDto: CreateActivityDto): Promise<ActivityResponseDto> {
    return await this.activityService.logActivity(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 50)' })
  @ApiQuery({ name: 'activity_type', required: false, enum: ActivityType, enumName: 'ActivityType', description: 'Filter by activity type' })
  @ApiQuery({ name: 'entity_type', required: false, type: String, description: 'Filter by entity type' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/ActivityResponseDto' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('activity_type') activityType?: ActivityType,
    @Query('entity_type') entityType?: string,
    @Query('user_id') userId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    return await this.activityService.findAll(
      page,
      limit,
      activityType,
      entityType,
      userId,
      startDateObj,
      endDateObj
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Activity statistics retrieved successfully',
    schema: {
      type: 'object',
      additionalProperties: { type: 'number' }
    }
  })
  async getStats(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    return await this.activityService.getActivityStats(startDateObj, endDateObj);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get activities for a specific entity' })
  @ApiParam({ name: 'entityType', description: 'Type of entity (order, customer, user, etc.)' })
  @ApiParam({ name: 'entityId', description: 'ID of the entity' })
  @ApiResponse({
    status: 200,
    description: 'Entity activities retrieved successfully',
    type: [ActivityResponseDto]
  })
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string
  ): Promise<ActivityResponseDto[]> {
    return await this.activityService.findByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity retrieved successfully',
    type: ActivityResponseDto
  })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<ActivityResponseDto> {
    return await this.activityService.findById(id);
  }
}