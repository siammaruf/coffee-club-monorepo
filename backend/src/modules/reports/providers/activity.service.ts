import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Activity, ActivityType } from '../entities/activity.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { ActivityResponseDto } from '../dto/activity-response.dto';
import * as moment from 'moment';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async logActivity(createActivityDto: CreateActivityDto): Promise<ActivityResponseDto> {
    try {
      const activity = this.activityRepository.create(createActivityDto);
      const savedActivity = await this.activityRepository.save(activity);
      
      return await this.findById(savedActivity.id);
    } catch (error) {
      this.logger.error(`Failed to log activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 50,
    activityType?: ActivityType,
    entityType?: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ data: ActivityResponseDto[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.customer', 'customer')
      .orderBy('activity.created_at', 'DESC');

    if (activityType) {
      queryBuilder.andWhere('activity.activity_type = :activityType', { activityType });
    }

    if (entityType) {
      queryBuilder.andWhere('activity.entity_type = :entityType', { entityType });
    }

    if (userId) {
      queryBuilder.andWhere('activity.user_id = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('activity.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('activity.created_at <= :endDate', { endDate });
    }

    const [activities, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = activities.map(activity => this.mapToResponseDto(activity));

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ActivityResponseDto> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['user', 'customer']
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    return this.mapToResponseDto(activity);
  }

  async findByEntity(entityType: string, entityId: string): Promise<ActivityResponseDto[]> {
    const activities = await this.activityRepository.find({
      where: { entity_type: entityType, entity_id: entityId },
      relations: ['user', 'customer'],
      order: { created_at: 'DESC' }
    });

    return activities.map(activity => this.mapToResponseDto(activity));
  }

  async getActivityStats(startDate?: Date, endDate?: Date): Promise<Record<string, number>> {
    const queryBuilder = this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.activity_type', 'activity_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('activity.activity_type');

    if (startDate) {
      queryBuilder.andWhere('activity.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('activity.created_at <= :endDate', { endDate });
    }

    const results = await queryBuilder.getRawMany();
    
    const stats: Record<string, number> = {};
    results.forEach(result => {
      stats[result.activity_type] = parseInt(result.count);
    });

    return stats;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldActivities(): Promise<void> {
    try {
      const threeDaysAgo = moment().subtract(3, 'days').toDate();
      
      const result = await this.activityRepository.delete({
        created_at: LessThan(threeDaysAgo)
      });

      this.logger.log(`Cleaned up ${result.affected} old activity records older than 3 days`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old activities: ${error.message}`, error.stack);
    }
  }

  async logOrderActivity(
    activityType: ActivityType,
    orderId: string,
    userId?: string,
    customerId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      [ActivityType.ORDER_CREATED]: 'New order created',
      [ActivityType.ORDER_UPDATED]: 'Order updated',
      [ActivityType.ORDER_COMPLETED]: 'Order completed',
      [ActivityType.ORDER_CANCELLED]: 'Order cancelled'
    };

    await this.logActivity({
      activity_type: activityType,
      description: descriptions[activityType] || 'Order activity',
      entity_type: 'order',
      entity_id: orderId,
      user_id: userId,
      customer_id: customerId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  async logUserActivity(
    activityType: ActivityType,
    userId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      [ActivityType.USER_LOGIN]: 'User logged in',
      [ActivityType.USER_LOGOUT]: 'User logged out',
      [ActivityType.STAFF_CHECK_IN]: 'Staff checked in',
      [ActivityType.STAFF_CHECK_OUT]: 'Staff checked out'
    };

    await this.logActivity({
      activity_type: activityType,
      description: descriptions[activityType] || 'User activity',
      entity_type: 'user',
      entity_id: userId,
      user_id: userId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  async logCustomerActivity(
    activityType: ActivityType,
    customerId: string,
    userId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      [ActivityType.CUSTOMER_CREATED]: 'New customer created',
      [ActivityType.CUSTOMER_UPDATED]: 'Customer information updated'
    };

    await this.logActivity({
      activity_type: activityType,
      description: descriptions[activityType] || 'Customer activity',
      entity_type: 'customer',
      entity_id: customerId,
      user_id: userId,
      customer_id: customerId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  async logKitchenActivity(
    activityType: ActivityType,
    kitchenOrderId: string,
    userId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const descriptions = {
      [ActivityType.KITCHEN_ORDER_CREATED]: 'Kitchen order created',
      [ActivityType.KITCHEN_ORDER_APPROVED]: 'Kitchen order approved'
    };

    await this.logActivity({
      activity_type: activityType,
      description: descriptions[activityType] || 'Kitchen activity',
      entity_type: 'kitchen_order',
      entity_id: kitchenOrderId,
      user_id: userId,
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  private mapToResponseDto(activity: Activity): ActivityResponseDto {
    return {
      id: activity.id,
      activity_type: activity.activity_type,
      description: activity.description,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id,
      user: activity.user ? {
        id: activity.user.id,
        name: activity.user.first_name,
        role: activity.user.role
      } : undefined,
      customer: activity.customer ? {
        id: activity.customer.id,
        name: activity.customer.name,
        phone: activity.customer.phone
      } : undefined,
      metadata: activity.metadata,
      ip_address: activity.ip_address,
      user_agent: activity.user_agent,
      created_at: activity.created_at,
      updated_at: activity.updated_at
    };
  }
}