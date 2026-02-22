import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Table } from '../../table/entities/table.entity';
import { OrderItemService } from '../../order-items/providers/order-item.service';
import { OrderTokensService } from '../../order-tokens/provider/order-tokens.service';
import { OrderItemResponseDto } from '../../order-items/dto/order-item-response.dto';
import { ItemType } from '../../items/enum/item-type.enum';
import { OrderTokenPriority } from 'src/modules/order-tokens/enum/OrderTokenPriority.enum';
import { OrderTokenStatus } from 'src/modules/order-tokens/enum/OrderTokenStatus.enum';
import { DiscountType } from '../../discount/enum/discount-type.enum';
import { OrderStatus } from '../enum/order-status.enum';
import { TableStatus } from 'src/modules/table/enum/table-status.enum';
import { CustomerService } from 'src/modules/customers/providers/customer.service';
import { TokenType } from '../../order-tokens/enum/TokenType.enum';
import { CacheService } from 'src/modules/cache/cache.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly orderItemService: OrderItemService,
    private readonly orderTokensService: OrderTokensService,
    private readonly customerService: CustomerService,
    private readonly cacheService: CacheService,
  ) {}

  private calculateDiscountAmount(totalAmount: number, discount: any): number {
    if (!discount) return 0;

    if (discount.discount_type === DiscountType.PERCENTAGE) {
      return (totalAmount * discount.discount_value) / 100;
    } else if (discount.discount_type === DiscountType.FIXED) {
      return discount.discount_value;
    }
    return 0;
  }

  private async generateOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2); 
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`; 
    
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const todayOrdersCount = await this.orderRepository.count({
      where: {
        created_at: Between(startOfDay, endOfDay)
      }
    });
    
    const orderNumber = (todayOrdersCount + 1).toString().padStart(3, '0');
    return `ORD-${datePrefix}${orderNumber}`;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { tables: tableData, order_items, discount, ...rest } = createOrderDto;
    const tableIds = tableData?.map(table => typeof table === 'string' ? table : table.id) || [];

    let tables: Table[] = [];
    if (tableIds.length > 0) {
      tables = await this.tableRepository.findBy({ id: In(tableIds) });
      if (tables.length !== tableIds.length) {
        throw new NotFoundException('One or more tables not found');
      }
    }
    
    const totalAmount = order_items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
    const discountAmount = this.calculateDiscountAmount(totalAmount, discount);
    const order_id = await this.generateOrderId();
    
    const order = this.orderRepository.create({
      ...rest,
      order_id,
      tables,
      discount,
      user: createOrderDto.user_id ? { id: createOrderDto.user_id } : undefined,
      total_amount: totalAmount,
      discount_amount: discountAmount
    });
    const savedOrder = await this.orderRepository.save(order);
    
    if (savedOrder.status !== OrderStatus.COMPLETED && savedOrder.status !== OrderStatus.CANCELLED) {
      for (const table of tables) {
        if (table.status !== TableStatus.RESERVED) {
          table.status = TableStatus.OCCUPIED;
          await this.tableRepository.save(table);
        }
      }
    }
    
    const createdOrderItems: OrderItemResponseDto[] = [];
    if (order_items && order_items.length > 0) {
      for (const orderItemDto of order_items) {
        const orderItemData = {
          quantity: orderItemDto.quantity,
          unit_price: orderItemDto.unit_price,
          item: orderItemDto.item,
          order: savedOrder,
        };
        const createdItem = await this.orderItemService.create({
          ...orderItemData,
          total_price: orderItemData.quantity * orderItemData.unit_price,
          item_id: orderItemDto.item_id,
          item_variation_id: orderItemDto.item_variation_id,
        });
        createdOrderItems.push(createdItem);
      }
    }

    if (createdOrderItems.length > 0) {
      await this.createTokensByItemType(savedOrder.id, createdOrderItems);
    }
    
    await this.invalidateCache();
    return savedOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ 
      where: { id }, 
      relations: ['tables', 'orderItems'] 
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.order_id) {
      order.order_id = await this.generateOrderId();
    }

    if (updateOrderDto.tables) {
      const tableIds = updateOrderDto.tables.map(table => 
        typeof table === 'string' ? table : table.id
      );
      
      const tables = await this.tableRepository.findBy({ id: In(tableIds) });
      if (tables.length !== tableIds.length) {
        throw new NotFoundException('One or more tables not found');
      }
      order.tables = tables;
    }

    if (updateOrderDto.order_items) {
      const existingItems = order.orderItems || [];
      const updatedItemIds = updateOrderDto.order_items
        .filter(item => 'id' in item && item.id)
        .map(item => (item as any).id as string);
    
      for (const existingItem of existingItems) {
        if (!updatedItemIds.includes(existingItem.id)) {
          await this.orderItemService.remove(existingItem.id);
        }
      }
    
      const createdOrderItems: OrderItemResponseDto[] = [];
      for (const orderItemDto of updateOrderDto.order_items) {
        if ('id' in orderItemDto && orderItemDto.id) {
          const updatedItem = await this.orderItemService.update(orderItemDto.id as string, {
            quantity: orderItemDto.quantity,
            unit_price: orderItemDto.unit_price,
            item: orderItemDto.item,
            item_id: orderItemDto.item_id,
            item_variation_id: orderItemDto.item_variation_id,
          });
          createdOrderItems.push(updatedItem);
        } else {
          const orderItemData = {
            quantity: orderItemDto.quantity,
            unit_price: orderItemDto.unit_price,
            item: orderItemDto.item,
            order: order,
            order_id: order.id,
          };
    
          const createdItem = await this.orderItemService.create({
            ...orderItemData,
            total_price: orderItemData.quantity * orderItemData.unit_price,
            item_id: orderItemDto.item_id,
            item_variation_id: orderItemDto.item_variation_id,
          });
          createdOrderItems.push(createdItem);
        }
      }
    
      if (createdOrderItems.length > 0) {
        await this.createTokensByItemType(order.id, createdOrderItems);
      } else {
        const existingTokens = await this.orderTokensService.findByOrderId(order.id);
        for (const token of existingTokens) {
          await this.orderTokensService.remove(token.id);
        }
      }
    
      const reloadedOrder = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['orderItems', 'orderItems.item', 'orderTokens', 'tables', 'customer', 'user', 'discount']
      });
      if (reloadedOrder) {
        Object.assign(order, reloadedOrder);
      }
    }

    if (updateOrderDto.discount) {
      const discountAmount = this.calculateDiscountAmount(
        updateOrderDto.total_amount || order.total_amount,
        updateOrderDto.discount
      );
      updateOrderDto.discount_amount = discountAmount;
    }

    if (updateOrderDto.customer_id !== undefined) {
      order.customer = updateOrderDto.customer_id ? { id: updateOrderDto.customer_id } as any : undefined;
    }

    const previousStatus = order.status;
    Object.assign(order, updateOrderDto);
    const updatedOrder = await this.orderRepository.save(order);

    if ((updatedOrder.status === OrderStatus.COMPLETED || updatedOrder.status === OrderStatus.CANCELLED) && 
        previousStatus !== OrderStatus.COMPLETED && 
        previousStatus !== OrderStatus.CANCELLED) {
      for (const table of updatedOrder.tables) {
        table.status = TableStatus.AVAILABLE;
        await this.tableRepository.save(table);
      }
    }

    if (order.status === OrderStatus.COMPLETED && previousStatus !== OrderStatus.COMPLETED) {
      const durationInMinutes = Math.floor((Date.now() - order.created_at.getTime()) / (1000 * 60));
      order.completion_time = durationInMinutes;
    }

    if (updatedOrder.status === OrderStatus.COMPLETED && 
        previousStatus !== OrderStatus.COMPLETED) {
      try {
        const orderWithTokens = await this.orderRepository.findOne({
          where: { id: updatedOrder.id },
          relations: ['orderTokens']
        });
        
        if (orderWithTokens?.orderTokens && orderWithTokens.orderTokens.length > 0) {
          for (const token of orderWithTokens.orderTokens) {
            await this.orderTokensService.update(token.id, {
              status: OrderTokenStatus.DELIVERED
            });
          }
        }
      } catch (error) {
        console.error('Failed to update order tokens status:', error);
      }
    }

    if (updatedOrder.status === OrderStatus.COMPLETED && 
        previousStatus !== OrderStatus.COMPLETED && updateOrderDto.customer_id) {
      try {
        const finalAmount = updatedOrder.total_amount - (updatedOrder.discount_amount || 0);

        if (updateOrderDto.redeem_amount && updateOrderDto.redeem_amount > 0) {
          await this.customerService.redeemPoints(
            updateOrderDto.customer_id ? updateOrderDto.customer_id as any : (updatedOrder.customer?.id || null),
            updateOrderDto.redeem_amount
          );
          console.log(`Redeemed ${updateOrderDto.redeem_amount} Taka from customer points`);
        }
        
        await this.customerService.addPointsFromOrder(
          updateOrderDto.customer_id ? updateOrderDto.customer_id as any : (updatedOrder.customer?.id || null),
          finalAmount
        );
        
      } catch (error) {
        console.error('Failed to process customer points:', error);
      }
    }
    
    await this.invalidateCache();
    return updatedOrder;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    dateFilter?: 'today' | 'custom' | 'all',
    startDate?: string,
    endDate?: string,
    status?: OrderStatus
  ): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusCounts: Record<string, number>;
  }> {
    const cacheKey = `orders:all:${page}:${limit}:${search || ''}:${dateFilter || ''}:${startDate || ''}:${endDate || ''}:${status || ''}`;
    const cached = await this.cacheService.get<{
      data: Order[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      statusCounts: Record<string, number>;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.tables', 'tables')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.discount', 'discount')
      .leftJoinAndSelect('order.orderItems', 'order_items')
      .leftJoinAndSelect('order_items.item', 'item')
      .leftJoinAndSelect('order_items.variation', 'variation');

    // Status filter
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(order.order_type ILIKE :search OR order.status ILIKE :search OR order.payment_method ILIKE :search OR customer.name ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      if (dateFilter === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        queryBuilder.andWhere('order.created_at BETWEEN :startOfDay AND :endOfDay', {
          startOfDay,
          endOfDay
        });
      } else if (dateFilter === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate: start,
          endDate: end
        });
      }
    }

    const [data, total] = await queryBuilder
      .orderBy('order.created_at', 'DESC')
      .addOrderBy('order.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    // Status counts query - applies same date/search filters but NOT status filter
    const countsBuilder = this.orderRepository.createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count');

    if (search) {
      countsBuilder
        .leftJoin('order.customer', 'customer')
        .leftJoin('order.user', 'user')
        .andWhere(
          '(order.order_type ILIKE :search OR order.status ILIKE :search OR order.payment_method ILIKE :search OR customer.name ILIKE :search OR user.name ILIKE :search)',
          { search: `%${search}%` }
        );
    }

    if (dateFilter && dateFilter !== 'all') {
      if (dateFilter === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        countsBuilder.andWhere('order.created_at BETWEEN :startOfDay AND :endOfDay', {
          startOfDay,
          endOfDay
        });
      } else if (dateFilter === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        countsBuilder.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate: start,
          endDate: end
        });
      }
    }

    countsBuilder.groupBy('order.status');
    const rawCounts = await countsBuilder.getRawMany();

    const statusCounts: Record<string, number> = { PENDING: 0, PREPARING: 0, COMPLETED: 0, CANCELLED: 0 };
    for (const row of rawCounts) {
      statusCounts[row.status] = parseInt(row.count, 10);
    }

    const result = {
      data,
      total,
      page,
      limit,
      totalPages,
      statusCounts,
    };

    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: string): Promise<Order> {
    const cacheKey = `orders:${id}`;
    const cached = await this.cacheService.get<Order>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const order = await this.orderRepository.findOne({ 
      where: { id }, 
      relations: [
        'tables',
        'customer',
        'user',
        'discount',
        'orderItems',
        'orderItems.item',
        'orderItems.variation',
        'orderTokens',
        'orderTokens.order_items',
      ] 
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    await this.cacheService.set(cacheKey, order, 3600);
    return order;
  }

  private async createTokensByItemType(orderId: string, createdOrderItems: OrderItemResponseDto[]): Promise<void> {
    const existingTokens = await this.orderTokensService.findByOrderId(orderId);
    for (const token of existingTokens) {
      await this.orderTokensService.remove(token.id);
    }
    
    const barItems = createdOrderItems.filter(item => {
      const hasValidId = item.id && item.id.trim() !== '';
      const isBarType = item.item?.type === ItemType.BAR;
      return hasValidId && isBarType;
    });
    
    const kitchenItems = createdOrderItems.filter(item => {
      const hasValidId = item.id && item.id.trim() !== '';
      const isKitchenType = item.item?.type === ItemType.KITCHEN;
      return hasValidId && isKitchenType;
    });
  
    if (barItems.length > 0) {
      const barTokenNumber = await this.generateTokenNumber('B');
      const barTokenDto = {
        token: barTokenNumber,
        token_type: TokenType.BAR,
        orderId: orderId,
        order_items: barItems.map(item => ({ id: item.id })),
        priority: OrderTokenPriority.NORMAL,
        status: OrderTokenStatus.PENDING,
      };
  
      await this.orderTokensService.create({
        token: barTokenDto.token,
        token_type: barTokenDto.token_type,
        orderId: barTokenDto.orderId,
        order_items: barItems,
        priority: barTokenDto.priority,
        status: barTokenDto.status
      });
    }
    
    if (kitchenItems.length > 0) {
      const kitchenTokenNumber = await this.generateTokenNumber('K');
      const kitchenTokenDto = {
        token: kitchenTokenNumber,
        token_type: TokenType.KITCHEN,
        orderId: orderId,
        order_items: kitchenItems.map(item => ({ id: item.id })),
        priority: OrderTokenPriority.NORMAL,
        status: OrderTokenStatus.PENDING,
      };
  
      await this.orderTokensService.create({
        token: kitchenTokenDto.token,
        token_type: kitchenTokenDto.token_type,
        orderId: kitchenTokenDto.orderId,
        order_items: kitchenItems,
        priority: kitchenTokenDto.priority,
        status: kitchenTokenDto.status
      });
    }
  }

  private async generateTokenNumber(prefix: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const uniqueId = `${timestamp.toString().slice(-6)}${random}`;
    const tokenNumber = `${prefix}-${dateStr}-${uniqueId.slice(-3)}`;
    
    const existingToken = await this.orderTokensService.findByToken(tokenNumber);
    if (existingToken) {
      const fallbackNumber = `${prefix}-${dateStr}-${timestamp.toString().slice(-3)}`;
      return fallbackNumber;
    }
    
    return tokenNumber;
  }

  async remove(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['tables']
    });
    if (!order) {
        throw new NotFoundException('Order not found');
    }

    // Release occupied tables
    if (order.tables && order.tables.length > 0) {
        for (const table of order.tables) {
            if (table.status === TableStatus.OCCUPIED) {
                table.status = TableStatus.AVAILABLE;
                await this.tableRepository.save(table);
            }
        }
    }

    // Soft delete (sets deleted_at)
    await this.orderRepository.softDelete(id);
    await this.invalidateCache();
    return order;
  }
  
  private async invalidateCache(): Promise<void> {
    const keys = await this.cacheService.getKeys('orders:*');
    if (keys.length > 0) {
      await this.cacheService.deleteMany(keys);
    }
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.orderRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.orderRepository.createQueryBuilder('order')
            .withDeleted()
            .leftJoinAndSelect('order.tables', 'tables')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.user', 'user')
            .where('order.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(order.order_id) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('order.deleted_at', 'DESC')
            .addOrderBy('order.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.orderRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.orderRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: ['orderItems', 'orderTokens', 'tables'],
        });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }

        // Delete order tokens first (cleans up order_token_items junction)
        if (entity.orderTokens?.length) {
            for (const token of entity.orderTokens) {
                await this.orderTokensService.permanentDelete(token.id);
            }
        }

        // Delete order items
        if (entity.orderItems?.length) {
            for (const item of entity.orderItems) {
                await this.orderItemService.permanentDelete(item.id);
            }
        }

        // Clear order_tables join table
        if (entity.tables?.length) {
            await this.orderRepository
                .createQueryBuilder()
                .relation(Order, 'tables')
                .of(id)
                .remove(entity.tables.map(t => t.id));
        }

        await this.orderRepository.delete(id);
        await this.invalidateCache();
    }
}
