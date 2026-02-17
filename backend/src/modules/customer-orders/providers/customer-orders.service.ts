import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Item } from '../../items/entities/item.entity';
import { Table } from '../../table/entities/table.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CartService } from '../../cart/providers/cart.service';
import { EmailService } from '../../email/email.service';
import { CreateCustomerOrderDto } from '../dto/create-customer-order.dto';
import { OrderStatus } from '../../orders/enum/order-status.enum';
import { OrderType } from '../../orders/enum/order-type.enum';
import { ItemStatus } from '../../items/enum/item-status.enum';
import { ItemVariation } from '../../items/entities/item-variation.entity';
import { TableStatus } from '../../table/enum/table-status.enum';

@Injectable()
export class CustomerOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) {}

  private async generateWebOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const timestamp = Date.now().toString().slice(-5);
    return `WEB-${datePrefix}${timestamp}`;
  }

  async placeOrder(
    customerId: string,
    dto: CreateCustomerOrderDto,
  ): Promise<Order> {
    // 1. Look up customer
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // 2. Look up each item (with variations) and verify AVAILABLE status
    const itemIds = dto.items.map((i) => i.item_id);
    const items = await this.itemRepository.find({
      where: { id: In(itemIds) },
      relations: ['variations'],
    });

    if (items.length !== itemIds.length) {
      const foundIds = items.map((i) => i.id);
      const missingIds = itemIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Items not found: ${missingIds.join(', ')}`,
      );
    }

    const unavailableItems = items.filter(
      (item) =>
        item.status !== ItemStatus.AVAILABLE &&
        item.status !== ItemStatus.ON_SALE,
    );
    if (unavailableItems.length > 0) {
      throw new BadRequestException(
        `Items not available: ${unavailableItems.map((i) => i.name).join(', ')}`,
      );
    }

    // 3. Calculate prices server-side (never trust client)
    const itemMap = new Map(items.map((item) => [item.id, item]));
    let subTotal = 0;
    const orderItemsData = dto.items.map((orderItemInput) => {
      const item = itemMap.get(orderItemInput.item_id)!;
      let unitPrice: number;
      let variation: ItemVariation | null = null;

      if (orderItemInput.variation_id) {
        // Find and validate the variation
        variation = item.variations?.find(
          (v) => v.id === orderItemInput.variation_id,
        ) ?? null;
        if (!variation) {
          throw new BadRequestException(
            `Variation not found for item "${item.name}"`,
          );
        }
        if (
          variation.status !== ItemStatus.AVAILABLE &&
          variation.status !== ItemStatus.ON_SALE &&
          variation.status !== ItemStatus.ACTIVE
        ) {
          throw new BadRequestException(
            `Variation "${variation.name}" is not available`,
          );
        }
        unitPrice = Number(variation.sale_price) || Number(variation.regular_price);
      } else {
        unitPrice = Number(item.sale_price) || Number(item.regular_price);
      }

      const totalPrice = unitPrice * orderItemInput.quantity;
      subTotal += totalPrice;
      return {
        item,
        variation,
        quantity: orderItemInput.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    // 4. Handle tables for DINEIN
    let tables: Table[] = [];
    if (dto.order_type === OrderType.DINEIN) {
      if (!dto.table_ids || dto.table_ids.length === 0) {
        throw new BadRequestException(
          'Table IDs are required for dine-in orders',
        );
      }

      tables = await this.tableRepository.find({
        where: { id: In(dto.table_ids) },
      });

      if (tables.length !== dto.table_ids.length) {
        throw new NotFoundException('One or more tables not found');
      }

      const occupiedTables = tables.filter(
        (t) =>
          t.status !== TableStatus.AVAILABLE &&
          t.status !== TableStatus.RESERVED,
      );
      if (occupiedTables.length > 0) {
        throw new BadRequestException(
          `Tables not available: ${occupiedTables.map((t) => t.number).join(', ')}`,
        );
      }
    }

    // 5. Validate delivery address for DELIVERY orders
    if (dto.order_type === OrderType.DELIVERY && !dto.delivery_address) {
      throw new BadRequestException(
        'Delivery address is required for delivery orders',
      );
    }

    // 6. Use DataSource.transaction() to create Order + OrderItems atomically
    const order = await this.dataSource.transaction(async (manager) => {
      const orderId = await this.generateWebOrderId();

      const newOrder = manager.create(Order, {
        order_id: orderId,
        order_type: dto.order_type,
        status: OrderStatus.PENDING,
        order_source: 'web',
        payment_method: dto.payment_method,
        delivery_address: dto.delivery_address || undefined,
        special_instructions: dto.special_instructions || undefined,
        customer_phone: customer.phone,
        customer: customer,
        tables: tables,
        sub_total: subTotal,
        total_amount: subTotal,
        discount_amount: 0,
      } as Partial<Order>);

      const savedOrder = await manager.save(Order, newOrder);

      // Create order items
      const orderItems: OrderItem[] = [];
      for (const itemData of orderItemsData) {
        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          item: itemData.item,
          variation: itemData.variation,
          quantity: itemData.quantity,
          unit_price: itemData.unit_price,
          total_price: itemData.total_price,
        });
        const savedItem = await manager.save(OrderItem, orderItem);
        orderItems.push(savedItem);
      }

      // Update table status for DINEIN
      if (dto.order_type === OrderType.DINEIN && tables.length > 0) {
        for (const table of tables) {
          table.status = TableStatus.OCCUPIED;
          await manager.save(Table, table);
        }
      }

      savedOrder.orderItems = orderItems;
      return savedOrder;
    });

    // 7. Clear customer's cart after successful order
    try {
      await this.cartService.clearCart(customerId);
    } catch (error) {
      // Cart clearing failure should not fail the order
      console.error('Failed to clear cart after order:', error);
    }

    // 8. Send confirmation email
    if (customer.email) {
      try {
        await this.emailService.sendOtpEmail(
          customer.email,
          `Your order ${order.order_id} has been placed successfully. Total: ${order.total_amount}`,
        );
      } catch (error) {
        // Email failure should not fail the order
        console.error('Failed to send order confirmation email:', error);
      }
    }

    // 9. Return created order with items
    const fullOrder = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: [
        'orderItems',
        'orderItems.item',
        'orderItems.variation',
        'tables',
        'customer',
        'discount',
      ],
    });

    if (!fullOrder) {
      throw new NotFoundException('Order not found after creation');
    }

    return fullOrder;
  }

  async getOrders(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [data, total] = await this.orderRepository.findAndCount({
      where: { customer: { id: customerId } },
      relations: ['orderItems', 'orderItems.item', 'orderItems.variation', 'tables'],
      order: { created_at: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getOrder(customerId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: [
        'orderItems',
        'orderItems.item',
        'orderItems.variation',
        'tables',
        'customer',
        'discount',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (!order.customer || order.customer.id !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async cancelOrder(customerId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['tables', 'customer'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify ownership
    if (!order.customer || order.customer.id !== customerId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    // Only pending orders can be cancelled
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Only pending orders can be cancelled',
      );
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.orderRepository.save(order);

    // Release tables for DINEIN orders
    if (
      order.order_type === OrderType.DINEIN &&
      order.tables &&
      order.tables.length > 0
    ) {
      for (const table of order.tables) {
        table.status = TableStatus.AVAILABLE;
        await this.tableRepository.save(table);
      }
    }

    return updatedOrder;
  }
}
