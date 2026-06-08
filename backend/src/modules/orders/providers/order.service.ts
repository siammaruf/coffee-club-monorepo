import { Injectable, InternalServerErrorException, Logger, NotFoundException, Optional } from '@nestjs/common';
import { randomInt } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Table } from '../../table/entities/table.entity';
import { Item } from '../../items/entities/item.entity';
import { ItemVariation } from '../../items/entities/item-variation.entity';
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
import { SmsService } from '../../sms/sms.service';
import { WhatsAppMessageService } from '../../whatsapp/providers/whatsapp-message.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemVariation)
    private readonly itemVariationRepository: Repository<ItemVariation>,
    private readonly orderItemService: OrderItemService,
    private readonly orderTokensService: OrderTokensService,
    private readonly customerService: CustomerService,
    private readonly cacheService: CacheService,
    private readonly smsService: SmsService,
    @Optional() private readonly whatsappMessageService: WhatsAppMessageService,
  ) {}

  private readonly logger = new Logger(OrderService.name);

  private formatOrderCompletionSms(order: Order): string {
    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const total = `${Number(order.total_amount).toFixed(0)} Tk`;
    const discount = Number(order.discount_amount) || 0;

    if (discount > 0) {
      return `Order #${order.order_id}\nTotal: ${total} (Disc: ${discount.toFixed(0)} Tk)\n${date}\nThanks - Coffee Club`;
    }
    return `Order #${order.order_id}\nTotal: ${total}\n${date}\nThanks - Coffee Club`;
  }

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
    const prefix = `ORD-${datePrefix}`;

    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.order_id LIKE :prefix', { prefix: `${prefix}%` })
      .withDeleted()
      .orderBy('order.order_id', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastOrder && lastOrder.order_id) {
      const suffix = lastOrder.order_id.replace(prefix, '');
      const num = parseInt(suffix, 10);
      if (!isNaN(num)) {
        nextNumber = num + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
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

    let savedOrder: Order | undefined;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const order_id = await this.generateOrderId();
        const token_number = await this.generateUnifiedTokenNumber();

        const order = this.orderRepository.create({
          ...rest,
          order_id,
          token_number,
          tables,
          discount,
          user: createOrderDto.user_id ? { id: createOrderDto.user_id } : undefined,
          total_amount: totalAmount,
          discount_amount: discountAmount
        });
        savedOrder = await this.orderRepository.save(order);
        break;
      } catch (error: any) {
        if (error?.code === '23505' && attempts < maxAttempts) {
          this.logger.warn(`Order ID collision detected, retrying (attempt ${attempts}/${maxAttempts})...`);
          await new Promise((r) => setTimeout(r, 50 * attempts));
          continue;
        }
        throw error;
      }
    }

    if (!savedOrder) {
      throw new InternalServerErrorException('Failed to create order after maximum attempts');
    }
    
    if (savedOrder.status !== OrderStatus.COMPLETED && savedOrder.status !== OrderStatus.CANCELLED) {
      const tablesToUpdate = tables.filter(t => t.status !== TableStatus.RESERVED);
      if (tablesToUpdate.length > 0) {
        tablesToUpdate.forEach(t => (t.status = TableStatus.OCCUPIED));
        await this.tableRepository.save(tablesToUpdate);
      }
    }
    
    const createdOrderItems: OrderItemResponseDto[] = [];
    if (order_items && order_items.length > 0) {
      // Batch-fetch items and variations to properly populate relations
      const itemIds = order_items.map(i => i.item_id).filter((id): id is string => !!id);
      const variationIds = order_items.map(i => i.item_variation_id).filter((id): id is string => !!id);

      const items = itemIds.length > 0
        ? await this.itemRepository.find({ where: { id: In(itemIds) }, withDeleted: true })
        : [];
      const itemMap = new Map(items.map(i => [i.id, i]));

      const variations = variationIds.length > 0
        ? await this.itemVariationRepository.find({ where: { id: In(variationIds) }, withDeleted: true })
        : [];
      const variationMap = new Map(variations.map(v => [v.id, v]));

      // Batch-create order items with proper relations
      const orderItemEntities = order_items.map(orderItemDto => {
        const item = orderItemDto.item_id ? itemMap.get(orderItemDto.item_id) : undefined;
        const variation = orderItemDto.item_variation_id ? variationMap.get(orderItemDto.item_variation_id) : undefined;

        return this.orderItemRepository.create({
          quantity: orderItemDto.quantity,
          unit_price: orderItemDto.unit_price,
          item,
          variation,
          order: savedOrder,
          total_price: orderItemDto.quantity * orderItemDto.unit_price,
        });
      });
      const savedItems = await this.orderItemRepository.save(orderItemEntities);
      // Reload to ensure item/variation relations are populated for token creation
      const reloadedItems = savedItems.length > 0
        ? await this.orderItemRepository.find({
            where: { id: In(savedItems.map(s => s.id)) },
            relations: ['item', 'variation'],
          })
        : [];
      createdOrderItems.push(...reloadedItems);
    }

    if (createdOrderItems.length > 0) {
      await this.createTokensByItemType(savedOrder.id, createdOrderItems);
    }
    
    await this.invalidateCache();

    // Fire-and-forget WhatsApp notification
    this.whatsappMessageService?.notifyNewOrder(savedOrder).catch((err) =>
      this.logger.warn(`WhatsApp order notification failed: ${err.message}`),
    );

    // Reload order with all relations so the response includes populated order_items and tokens
    const reloadedOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
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
        'orderTokens.order_items.item',
        'orderTokens.order_items.variation',
      ]
    });
    if (reloadedOrder) {
      return reloadedOrder;
    }

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

      // Batch remove items that are no longer in the update
      const itemsToRemove = existingItems.filter(item => !updatedItemIds.includes(item.id));
      if (itemsToRemove.length > 0) {
        await this.orderItemRepository.remove(itemsToRemove);
      }

      const createdOrderItems: OrderItemResponseDto[] = [];
      const updatePromises: Promise<OrderItemResponseDto>[] = [];
      const createPromises: Promise<OrderItemResponseDto>[] = [];

      for (const orderItemDto of updateOrderDto.order_items) {
        if ('id' in orderItemDto && orderItemDto.id) {
          updatePromises.push(
            this.orderItemService.update(orderItemDto.id as string, {
              quantity: orderItemDto.quantity,
              unit_price: orderItemDto.unit_price,
              item: orderItemDto.item,
              item_id: orderItemDto.item_id,
              item_variation_id: orderItemDto.item_variation_id,
            }),
          );
        } else {
          createPromises.push(
            this.orderItemService.create({
              quantity: orderItemDto.quantity,
              unit_price: orderItemDto.unit_price,
              item: orderItemDto.item,
              order: order,
              total_price: orderItemDto.quantity * orderItemDto.unit_price,
              item_id: orderItemDto.item_id,
              item_variation_id: orderItemDto.item_variation_id,
            }),
          );
        }
      }

      // Batch execute updates and creates in parallel
      const updatedItems = await Promise.all(updatePromises);
      const createdItems = await Promise.all(createPromises);
      createdOrderItems.push(...updatedItems, ...createdItems);

      if (createdOrderItems.length > 0) {
        await this.createTokensByItemType(order.id, createdOrderItems);
      } else {
        const existingTokens = await this.orderTokensService.findByOrderId(order.id);
        if (existingTokens.length > 0) {
          await this.orderTokensService.removeMany(existingTokens.map(t => t.id));
        }
      }

      // Lightweight reload: only the relations we need
      const reloadedOrder = await this.orderRepository.findOne({
        where: { id: order.id },
        relations: ['orderItems', 'orderItems.item', 'orderItems.variation', 'orderTokens', 'tables', 'customer', 'user', 'discount']
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
      if (updatedOrder.tables?.length > 0) {
        updatedOrder.tables.forEach(t => (t.status = TableStatus.AVAILABLE));
        await this.tableRepository.save(updatedOrder.tables);
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
          const tokenUpdates = orderWithTokens.orderTokens.map(token => ({
            ...token,
            status: OrderTokenStatus.DELIVERED,
          }));
          await this.orderTokensService.updateMany(tokenUpdates);
        }
      } catch (error) {
        this.logger.warn('Failed to update order tokens status: ' + (error?.message || error));
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
          this.logger.log(`Redeemed ${updateOrderDto.redeem_amount} Taka from customer points`);
        }

        await this.customerService.addPointsFromOrder(
          updateOrderDto.customer_id ? updateOrderDto.customer_id as any : (updatedOrder.customer?.id || null),
          finalAmount
        );

      } catch (error) {
        this.logger.error('Failed to process customer points: ' + (error?.message || error));
      }
    }

    if (updatedOrder.status === OrderStatus.COMPLETED && previousStatus !== OrderStatus.COMPLETED) {
      const phoneTarget = updatedOrder.customer_phone || updatedOrder.customer?.phone;
      if (phoneTarget) {
        const message = this.formatOrderCompletionSms(updatedOrder);
        this.smsService.sendSms(phoneTarget, message).catch((err) =>
          this.logger.error('Order completion SMS failed: ' + (err?.message || err)),
        );
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
    status?: OrderStatus,
    orderType?: string,
  ): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusCounts: Record<string, number>;
  }> {
    const cacheKey = `orders:all:${page}:${limit}:${search || ''}:${dateFilter || ''}:${startDate || ''}:${endDate || ''}:${status || ''}:${orderType || ''}`;
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

    // Step 1: Query orders with only ManyToOne relations (avoids Cartesian product)
    const orderQueryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.discount', 'discount');

    // Status filter
    if (status) {
      orderQueryBuilder.andWhere('order.status = :status', { status });
    }

    // Order type filter
    if (orderType) {
      orderQueryBuilder.andWhere('order.order_type = :orderType', { orderType });
    }

    // Search filter
    if (search) {
      orderQueryBuilder.andWhere(
        '(order.order_type ILIKE :search OR order.status ILIKE :search OR order.payment_method ILIKE :search OR customer.name ILIKE :search OR user.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      if (dateFilter === 'today' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orderQueryBuilder.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate: start,
          endDate: end
        });
      } else if (dateFilter === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        orderQueryBuilder.andWhere('order.created_at BETWEEN :startOfDay AND :endOfDay', {
          startOfDay,
          endOfDay
        });
      } else if (dateFilter === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        orderQueryBuilder.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate: start,
          endDate: end
        });
      }
    }

    const [orders, total] = await orderQueryBuilder
      .orderBy('order.created_at', 'DESC')
      .addOrderBy('order.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Step 2: Load tables and orderItems separately to avoid Cartesian product
    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      // Load tables (ManyToMany)
      const ordersWithTables = await this.orderRepository.find({
        where: { id: In(orderIds) },
        relations: ['tables'],
      });
      const tableMap = new Map(ordersWithTables.map(o => [o.id, o.tables || []]));

      // Load orderItems with item, variation and order relation
      const orderItems = await this.orderItemRepository.find({
        where: { order: { id: In(orderIds) } },
        relations: ['item', 'variation', 'order'],
      });
      const orderItemMap = new Map<string, OrderItem[]>();
      for (const oi of orderItems) {
        const orderId = oi.order?.id;
        if (!orderId) continue;
        const existing = orderItemMap.get(orderId) || [];
        existing.push(oi);
        orderItemMap.set(orderId, existing);
      }

      // Attach to orders
      for (const order of orders) {
        order.tables = tableMap.get(order.id) || [];
        order.orderItems = orderItemMap.get(order.id) || [];
      }

      // Reload order items for any order that still has missing items
      // (handles stale cache or soft-deleted items that didn't load initially)
      const ordersWithMissingItems = orders.filter(o => o.orderItems?.some(oi => !oi.item));
      if (ordersWithMissingItems.length > 0) {
        const missingOrderIds = ordersWithMissingItems.map(o => o.id);
        const reloadedItems = await this.orderItemRepository.find({
          where: { order: { id: In(missingOrderIds) } },
          relations: ['item', 'variation'],
        });

        // Load soft-deleted items/variations separately and attach manually
        const missingItemIds = reloadedItems
          .filter(oi => !oi.item)
          .map(oi => (oi as any).item_id)
          .filter((id): id is string => !!id);
        const missingVariationIds = reloadedItems
          .filter(oi => !oi.variation)
          .map(oi => (oi as any).variation_id)
          .filter((id): id is string => !!id);

        if (missingItemIds.length > 0) {
          const deletedItems = await this.itemRepository.find({
            where: { id: In(missingItemIds) },
            withDeleted: true,
          });
          const itemMap = new Map(deletedItems.map(i => [i.id, i]));
          for (const oi of reloadedItems) {
            if (!oi.item && (oi as any).item_id) {
              oi.item = itemMap.get((oi as any).item_id) as Item;
            }
          }
        }

        if (missingVariationIds.length > 0) {
          const deletedVariations = await this.itemVariationRepository.find({
            where: { id: In(missingVariationIds) },
            withDeleted: true,
          });
          const varMap = new Map(deletedVariations.map(v => [v.id, v]));
          for (const oi of reloadedItems) {
            if (!oi.variation && (oi as any).variation_id) {
              oi.variation = varMap.get((oi as any).variation_id) || null;
            }
          }
        }

        const reloadedMap = new Map<string, OrderItem[]>();
        for (const oi of reloadedItems) {
          const oid = oi.order?.id;
          if (!oid) continue;
          const existing = reloadedMap.get(oid) || [];
          existing.push(oi);
          reloadedMap.set(oid, existing);
        }
        for (const order of ordersWithMissingItems) {
          order.orderItems = reloadedMap.get(order.id) || order.orderItems || [];
        }
      }
    }

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

    if (orderType) {
      countsBuilder.andWhere('order.order_type = :orderType', { orderType });
    }

    if (dateFilter && dateFilter !== 'all') {
      if (dateFilter === 'today' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        countsBuilder.andWhere('order.created_at BETWEEN :startDate AND :endDate', {
          startDate: start,
          endDate: end
        });
      } else if (dateFilter === 'today') {
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
      data: orders,
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
    
    if (cached && !cached.orderItems?.some(oi => !oi.item)) {
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
        'orderTokens.order_items.item',
        'orderTokens.order_items.variation',
      ]
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // If any order items have a null item relation (stale cache or soft-deleted item),
    // reload them explicitly and invalidate the old cache entry.
    if (order.orderItems?.some(oi => !oi.item)) {
      const reloadedItems = await this.orderItemRepository.find({
        where: { order: { id } },
        relations: ['item', 'variation'],
      });

      // Load soft-deleted items separately and attach them manually
      const missingItemIds = reloadedItems
        .filter(oi => !oi.item)
        .map(oi => (oi as any).item_id)
        .filter((id): id is string => !!id);
      const missingVariationIds = reloadedItems
        .filter(oi => !oi.variation)
        .map(oi => (oi as any).variation_id)
        .filter((id): id is string => !!id);

      if (missingItemIds.length > 0) {
        const deletedItems = await this.itemRepository.find({
          where: { id: In(missingItemIds) },
          withDeleted: true,
        });
        const itemMap = new Map(deletedItems.map(i => [i.id, i]));
        for (const oi of reloadedItems) {
          if (!oi.item && (oi as any).item_id) {
            oi.item = itemMap.get((oi as any).item_id) as Item;
          }
        }
      }

      if (missingVariationIds.length > 0) {
        const deletedVariations = await this.itemVariationRepository.find({
          where: { id: In(missingVariationIds) },
          withDeleted: true,
        });
        const varMap = new Map(deletedVariations.map(v => [v.id, v]));
        for (const oi of reloadedItems) {
          if (!oi.variation && (oi as any).variation_id) {
            oi.variation = varMap.get((oi as any).variation_id) || null;
          }
        }
      }

      order.orderItems = reloadedItems;
      await this.cacheService.delete(cacheKey);
    }
    
    await this.cacheService.set(cacheKey, order, 3600);
    return order;
  }

  private async createTokensByItemType(orderId: string, createdOrderItems: OrderItemResponseDto[]): Promise<void> {
    const existingTokens = await this.orderTokensService.findByOrderId(orderId);
    if (existingTokens.length > 0) {
      await this.orderTokensService.removeMany(existingTokens.map(t => t.id));
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
      await this.createTokenWithRetry('B', orderId, barItems);
    }
    
    if (kitchenItems.length > 0) {
      await this.createTokenWithRetry('K', orderId, kitchenItems);
    }
  }

  async regenerateTokens(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.item', 'orderItems.variation'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Reload order items explicitly to ensure soft-deleted items are included
    const orderItems = await this.orderItemRepository.find({
      where: { order: { id: orderId } },
      relations: ['item', 'variation'],
    });

    // Load soft-deleted items/variations separately and attach manually
    const missingItemIds = orderItems
      .filter(oi => !oi.item)
      .map(oi => (oi as any).item_id)
      .filter((id): id is string => !!id);
    const missingVariationIds = orderItems
      .filter(oi => !oi.variation)
      .map(oi => (oi as any).variation_id)
      .filter((id): id is string => !!id);

    if (missingItemIds.length > 0) {
      const deletedItems = await this.itemRepository.find({
        where: { id: In(missingItemIds) },
        withDeleted: true,
      });
      const itemMap = new Map(deletedItems.map(i => [i.id, i]));
      for (const oi of orderItems) {
        if (!oi.item && (oi as any).item_id) {
          oi.item = itemMap.get((oi as any).item_id) as Item;
        }
      }
    }

    if (missingVariationIds.length > 0) {
      const deletedVariations = await this.itemVariationRepository.find({
        where: { id: In(missingVariationIds) },
        withDeleted: true,
      });
      const varMap = new Map(deletedVariations.map(v => [v.id, v]));
      for (const oi of orderItems) {
        if (!oi.variation && (oi as any).variation_id) {
          oi.variation = varMap.get((oi as any).variation_id) || null;
        }
      }
    }

    const mappedItems = orderItems.map(oi => ({
      id: oi.id,
      quantity: oi.quantity,
      unit_price: oi.unit_price,
      total_price: oi.total_price,
      item: oi.item,
      item_variation: oi.variation || undefined,
      created_at: oi.created_at,
      updated_at: oi.updated_at,
    })) as OrderItemResponseDto[];

    await this.createTokensByItemType(orderId, mappedItems);

    // Invalidate cache and reload full order
    await this.cacheService.delete(`orders:${orderId}`);
    return this.findOne(orderId);
  }

  private async createTokenWithRetry(
    prefix: string,
    orderId: string,
    items: OrderItemResponseDto[],
  ): Promise<void> {
    const tokenType = prefix === 'B' ? TokenType.BAR : TokenType.KITCHEN;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const tokenNumber = await this.generateTokenNumber(prefix);
        await this.orderTokensService.create({
          token: tokenNumber,
          token_type: tokenType,
          orderId: orderId,
          order_items: items,
          priority: OrderTokenPriority.NORMAL,
          status: OrderTokenStatus.PENDING,
        });
        return;
      } catch (error: any) {
        if (error?.code === '23505' && attempts < maxAttempts) {
          this.logger.warn(
            `Order token collision (${prefix}), retrying (attempt ${attempts}/${maxAttempts})...`,
          );
          await new Promise((r) => setTimeout(r, 50 * attempts));
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException(
      `Failed to create ${prefix === 'B' ? 'bar' : 'kitchen'} token after maximum attempts`,
    );
  }

  /**
   * Generates a short daily order token in the format T-YYMMDD-XXXX
   * - T = unified order prefix
   * - YYMMDD = date (e.g. 260607 = 7 June 2026)
   * - XXXX = 4-digit random number (1000-9999)
   * Total length: 13 characters. Example: T-260607-4829
   */
  private async generateUnifiedTokenNumber(): Promise<string> {
    const dateStr = this.getShortDateStr();
    const random = randomInt(1000, 10000).toString(); // 1000-9999
    return `T-${dateStr}-${random}`;
  }

  /**
   * Generates a short daily kitchen/bar token in the format K-YYMMDD-XXXX
   * - K/B = kitchen/bar prefix
   * - YYMMDD = date (e.g. 260607 = 7 June 2026)
   * - XXXX = 4-digit random number (1000-9999)
   * Total length: 13 characters. Example: K-260607-4829
   */
  private async generateTokenNumber(prefix: string): Promise<string> {
    const dateStr = this.getShortDateStr();
    const random = randomInt(1000, 10000).toString(); // 1000-9999
    return `${prefix}-${dateStr}-${random}`;
  }

  private getShortDateStr(): string {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2); // last 2 digits
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`; // e.g. "260607"
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
        const tablesToRelease = order.tables.filter(t => t.status === TableStatus.OCCUPIED);
        if (tablesToRelease.length > 0) {
            tablesToRelease.forEach(t => (t.status = TableStatus.AVAILABLE));
            await this.tableRepository.save(tablesToRelease);
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

        // Batch delete order tokens first (cleans up order_token_items junction)
        if (entity.orderTokens?.length) {
            await this.orderTokensService.forceDeleteMany(entity.orderTokens.map(t => t.id));
        }

        // Batch delete order items
        if (entity.orderItems?.length) {
            await this.orderItemService.forceDeleteMany(entity.orderItems.map(i => i.id));
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

    async bulkRestore(ids: string[]): Promise<void> {
        await this.orderRepository.restore(ids);
        await this.invalidateCache();
    }

    async bulkPermanentDelete(ids: string[]): Promise<{ deleted: string[]; failed: { id: string; reason: string }[] }> {
        const deleted: string[] = [];
        const failed: { id: string; reason: string }[] = [];

        for (const id of ids) {
            try {
                const entity = await this.orderRepository.findOne({
                    where: { id },
                    withDeleted: true,
                    relations: ['orderItems', 'orderTokens', 'tables'],
                });
                if (!entity) {
                    failed.push({ id, reason: 'Record not found' });
                    continue;
                }
                if (!entity.deleted_at) {
                    failed.push({ id, reason: 'Record is not in trash' });
                    continue;
                }

                // Batch delete order tokens first (cleans up order_token_items junction)
                if (entity.orderTokens?.length) {
                    await this.orderTokensService.forceDeleteMany(entity.orderTokens.map(t => t.id));
                }

                // Batch delete order items
                if (entity.orderItems?.length) {
                    await this.orderItemService.forceDeleteMany(entity.orderItems.map(i => i.id));
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
                deleted.push(id);
            } catch (error) {
                failed.push({ id, reason: error?.message || 'Unknown error' });
            }
        }

        await this.invalidateCache();
        return { deleted, failed };
    }
}
