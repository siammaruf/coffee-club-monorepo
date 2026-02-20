import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Like, Between } from 'typeorm';
import { OrderToken } from '../entities/order-token.entity';
import { CreateOrderTokenDto } from '../dto/create-order-token.dto';
import { UpdateOrderTokenDto } from '../dto/update-order-token.dto';
import { OrderTokenResponseDto } from '../dto/order-token-response.dto';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

@Injectable()
export class OrderTokensService {
  constructor(
    @InjectRepository(OrderToken)
    private readonly orderTokenRepository: Repository<OrderToken>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(dto: CreateOrderTokenDto): Promise<OrderTokenResponseDto> {
    const order = await this.orderRepository.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    
    // Extract item IDs from order_items if they exist
    const itemIds = dto.order_items?.map(item => item.id).filter(id => id) || [];
    const items = itemIds.length > 0 ? await this.orderItemRepository.findByIds(itemIds) : [];
    
    if (itemIds.length > 0 && items.length !== itemIds.length) {
      throw new BadRequestException('Some order items not found');
    }
    
    const token = this.orderTokenRepository.create({
      token: dto.token,
      token_type: dto.token_type,
      priority: dto.priority,
      status: dto.status,
      readyAt: dto.readyAt,
      order,
      order_items: items,
    });
    const saved = await this.orderTokenRepository.save(token);
    return new OrderTokenResponseDto(saved);
  }

  async findAll(
    page?: string,
    limit?: string,
    search?: string
  ): Promise<{
    data: OrderTokenResponseDto[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const queryBuilder = this.orderTokenRepository
      .createQueryBuilder('orderToken')
      .leftJoinAndSelect('orderToken.order', 'order')
      .leftJoinAndSelect('orderToken.order_items', 'order_items');

    if (search) {
      queryBuilder.where(
        'orderToken.token ILIKE :search OR orderToken.status ILIKE :search OR orderToken.priority ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [orderTokens, total] = await queryBuilder
      .orderBy('orderToken.created_at', 'DESC')
      .addOrderBy('orderToken.id', 'ASC')
      .skip(skip)
      .take(limitNumber)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limitNumber);

    return {
      data: orderTokens.map(token => new OrderTokenResponseDto(token)),
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    };
  }

  async findOne(id: string): Promise<OrderTokenResponseDto> {
    const token = await this.orderTokenRepository.findOne({ 
      where: { id }, 
      relations: ['order', 'order_items', 'order_items.item'] 
    });
    if (!token) throw new NotFoundException('Order token not found');
    return new OrderTokenResponseDto(token);
  }

  async update(id: string, dto: UpdateOrderTokenDto): Promise<OrderTokenResponseDto> {
    const token = await this.orderTokenRepository.findOne({ 
      where: { id }, 
      relations: ['order', 'order_items', 'order_items.item'] 
    });

    console.log('token', token);
    console.log('Order Item dto', dto.order_items);

    if (!token) throw new NotFoundException('Order token not found');
    if (dto.orderId) {
      const order = await this.orderRepository.findOne({ where: { id: dto.orderId } });
      if (!order) throw new NotFoundException('Order not found');
      token.order = order;
    }
    if (dto.order_items) {
      const itemIds = dto.order_items.map(item => item.id).filter(id => id);
      const items = await this.orderItemRepository.findBy({ id: In(itemIds) });
      if (items.length !== itemIds.length) throw new BadRequestException('Some order items not found');
      token.order_items = items;
    }

    console.log('Order Item', token.order_items);

    // Update other fields
    if (dto.token) token.token = dto.token;
    if (dto.token_type) token.token_type = dto.token_type;
    if (dto.priority) token.priority = dto.priority;
    if (dto.status) token.status = dto.status;
    if (dto.readyAt !== undefined) token.readyAt = new Date(dto.readyAt);
    
    const saved = await this.orderTokenRepository.save(token);
    return new OrderTokenResponseDto(saved);
  }

  async findByOrderId(orderId: string): Promise<OrderTokenResponseDto[]> {
    const tokens = await this.orderTokenRepository.find({
      where: { order: { id: orderId } },
      relations: ['order', 'order_items', 'order_items.item']
    });
    
    return tokens.map(token => new OrderTokenResponseDto(token));
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.orderTokenRepository.softDelete(id);
    if (result.affected === 0) throw new NotFoundException('Order token not found');
    return { deleted: true };
  }

  async countTokensByPrefixAndDate(prefix: string, startDate: Date, endDate: Date): Promise<number> {
    return await this.orderTokenRepository.count({
      where: {
        token: Like(`${prefix}-%`),
        createdAt: Between(startDate, endDate)
      }
    });
  }

  async findByToken(token: string): Promise<OrderToken | null> {
    return await this.orderTokenRepository.findOne({
      where: { token }
    });
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.orderTokenRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.orderTokenRepository.createQueryBuilder('orderToken')
            .withDeleted()
            .where('orderToken.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(orderToken.token) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('orderToken.deleted_at', 'DESC')
            .addOrderBy('orderToken.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.orderTokenRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.orderTokenRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.orderTokenRepository.delete(id);
    }
}
