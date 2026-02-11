import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { KitchenOrder } from "../entities/kitchen-order.entity";
import { KitchenOrderItem } from "../entities/kitchen-order-item.entity";
import { KitchenStock } from "../../kitchen-stock/entities/kitchen-stock.entity";
import { CreateKitchenOrderDto } from "../dto/kitchen-order-create.dto";
import { UpdateKitchenOrderDto } from "../dto/kitchen-order-update.dto";
import { KitchenOrderResponseDto } from "../dto/kitchen-order-response.dto";
import { User } from '../../users/entities/user.entity';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class KitchenOrderService {
  constructor(
    @InjectRepository(KitchenOrder)
    private readonly kitchenOrderRepository: Repository<KitchenOrder>,
    @InjectRepository(KitchenOrderItem)
    private readonly kitchenOrderItemRepository: Repository<KitchenOrderItem>,
    @InjectRepository(KitchenStock)
    private readonly kitchenStockRepository: Repository<KitchenStock>,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    kitchenStockId?: string
  ): Promise<{ data: KitchenOrderResponseDto[]; total: number }> {
    const cacheKey = `kitchen-orders:findAll:${page}:${limit}:${kitchenStockId || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as { data: KitchenOrderResponseDto[]; total: number };
    }

    const skip = (page - 1) * limit;
    
    let whereCondition = {};
    if (kitchenStockId) {
      whereCondition = { order_items: { kitchen_stock: { id: kitchenStockId } } };
    }
    
    const [orders, total] = await this.kitchenOrderRepository.findAndCount({
      where: whereCondition,
      relations: ['order_items', 'order_items.kitchen_stock', 'order_items.kitchen_stock.kitchen_item'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    
    const data = orders.map(order => new KitchenOrderResponseDto(order));
    const result = { data, total };
    
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: string): Promise<KitchenOrderResponseDto> {
    const cacheKey = `kitchen-orders:findOne:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as KitchenOrderResponseDto;
    }

    const order = await this.kitchenOrderRepository.findOne({ 
      where: { id },
      relations: ['order_items', 'order_items.kitchen_stock', 'order_items.kitchen_stock.kitchen_item'],
    });
    if (!order) {
      throw new NotFoundException(`Kitchen order with id ${id} not found`);
    }
    
    const result = new KitchenOrderResponseDto(order);
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findByStockId(kitchenStockId: string): Promise<KitchenOrderResponseDto[]> {
    const cacheKey = `kitchen-orders:findByStockId:${kitchenStockId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as KitchenOrderResponseDto[];
    }

    const orders = await this.kitchenOrderRepository.find({ 
      where: { order_items: { kitchen_stock: { id: kitchenStockId } } },
      relations: ['order_items', 'order_items.kitchen_stock', 'order_items.kitchen_stock.kitchen_item'],
      order: { created_at: 'DESC' },
    });
    
    const result = orders.map(order => new KitchenOrderResponseDto(order));
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  private async generateOrderId(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const datePrefix = `KO${year}${month}${day}`;
    
    const lastOrder = await this.kitchenOrderRepository.findOne({
      where: {
        order_id: Like(`${datePrefix}%`)
      },
      order: { order_id: 'DESC' }
    });
    
    let sequence = 1;
    if (lastOrder && lastOrder.order_id) {
      const lastSequence = parseInt(lastOrder.order_id.slice(-4));
      sequence = lastSequence + 1;
    }
    
    return `${datePrefix}${sequence.toString().padStart(4, '0')}`;
  }

  async create(createKitchenOrderDto: CreateKitchenOrderDto): Promise<KitchenOrderResponseDto> {
    const orderItems: KitchenOrderItem[] = [];
    let totalAmount = 0;

    for (const itemDto of createKitchenOrderDto.order_items) {
      const kitchenStock = await this.kitchenStockRepository.findOne({
        where: { id: itemDto.kitchen_stock_id },
        relations: ['kitchen_item'],
      });
      
      if (!kitchenStock) {
        throw new NotFoundException(`Kitchen stock with id ${itemDto.kitchen_stock_id} not found`);
      }

      if (Number(itemDto.quantity) > Number(kitchenStock.quantity)) {
        throw new BadRequestException(
          `Insufficient stock for ${kitchenStock.kitchen_item?.name || 'item'}. Available: ${kitchenStock.quantity}, Requested: ${itemDto.quantity}`
        );
      }

      const unitPrice = Number(kitchenStock.price);
      const itemTotalPrice = unitPrice * Number(itemDto.quantity);
      totalAmount += itemTotalPrice;

      const orderItem = this.kitchenOrderItemRepository.create({
        kitchen_stock: kitchenStock,
        quantity: itemDto.quantity,
        unit_price: unitPrice,
        total_price: itemTotalPrice,
      });

      orderItems.push(orderItem);
    }

    const order_id = await this.generateOrderId();

    const order = this.kitchenOrderRepository.create({
      order_id,
      user: createKitchenOrderDto.user_id ? { id: createKitchenOrderDto.user_id } as User : undefined,
      order_items: orderItems,
      total_amount: totalAmount,
      is_approved: false,
      description: createKitchenOrderDto.description,
    });
    
    const savedOrder = await this.kitchenOrderRepository.save(order);
    await this.invalidateCache();
    return new KitchenOrderResponseDto(savedOrder);
  }

  async update(id: string, updateKitchenOrderDto: UpdateKitchenOrderDto): Promise<KitchenOrderResponseDto> {
    const order = await this.kitchenOrderRepository.findOne({ 
      where: { id },
      relations: ['user', 'order_items', 'order_items.kitchen_stock', 'order_items.kitchen_stock.kitchen_item'],
    });
    
    if (!order) {
      throw new NotFoundException(`Kitchen order with id ${id} not found`);
    }

    if (!order.order_id) {
      order.order_id = await this.generateOrderId();
    }

    if (updateKitchenOrderDto.user_id !== undefined) {
      order.user = updateKitchenOrderDto.user_id ? { id: updateKitchenOrderDto.user_id } as User : undefined;
    }

    if (updateKitchenOrderDto.order_items) {
      await this.kitchenOrderItemRepository.remove(order.order_items);
      
      const newOrderItems: KitchenOrderItem[] = [];
      let totalAmount = 0;

      for (const itemDto of updateKitchenOrderDto.order_items) {
        const kitchenStock = await this.kitchenStockRepository.findOne({
          where: { id: itemDto.kitchen_stock_id },
          relations: ['kitchen_item'],
        });
        
        if (!kitchenStock) {
          throw new NotFoundException(`Kitchen stock with id ${itemDto.kitchen_stock_id} not found`);
        }

        if (Number(itemDto.quantity) > Number(kitchenStock.quantity)) {
          throw new BadRequestException(
            `Insufficient stock for ${kitchenStock.kitchen_item?.name || 'item'}. Available: ${kitchenStock.quantity}, Requested: ${itemDto.quantity}`
          );
        }

        const unitPrice = Number(kitchenStock.price);
        const itemTotalPrice = unitPrice * Number(itemDto.quantity);
        totalAmount += itemTotalPrice;

        const orderItem = this.kitchenOrderItemRepository.create({
          kitchen_order: order,
          kitchen_stock: kitchenStock,
          quantity: itemDto.quantity,
          unit_price: unitPrice,
          total_price: itemTotalPrice,
          updated_at: new Date(),
        });

        newOrderItems.push(orderItem);
      }

      order.order_items = newOrderItems;
      order.total_amount = totalAmount;
    }
    
    if (updateKitchenOrderDto.description !== undefined) {
      order.description = updateKitchenOrderDto.description;
    }

    if (updateKitchenOrderDto.is_approved !== undefined) {
      if (updateKitchenOrderDto.is_approved && !order.is_approved) {
        await this.validateAndReduceStock(order.order_items);
      }
      order.is_approved = updateKitchenOrderDto.is_approved;
    }
    
    order.updated_at = new Date();
    
    const savedOrder = await this.kitchenOrderRepository.save(order);
    await this.invalidateCache();
    return new KitchenOrderResponseDto(savedOrder);
  }

  async approve(id: string): Promise<KitchenOrderResponseDto> {
    const order = await this.kitchenOrderRepository.findOne({ 
      where: { id },
      relations: ['order_items', 'order_items.kitchen_stock', 'order_items.kitchen_stock.kitchen_item'],
    });
    
    if (!order) {
      throw new NotFoundException(`Kitchen order with id ${id} not found`);
    }

    if (order.is_approved) {
      throw new BadRequestException(`Kitchen order with id ${id} is already approved`);
    }

    await this.validateAndReduceStock(order.order_items);

    order.is_approved = true;
    order.updated_at = new Date();
    
    const savedOrder = await this.kitchenOrderRepository.save(order);
    await this.invalidateCache();
    return new KitchenOrderResponseDto(savedOrder);
  }

  private async validateAndReduceStock(orderItems: KitchenOrderItem[]): Promise<void> {
    for (const orderItem of orderItems) {
      const kitchenStock = await this.kitchenStockRepository.findOne({
        where: { id: orderItem.kitchen_stock.id },
        relations: ['kitchen_item'],
      });

      if (!kitchenStock) {
        throw new NotFoundException(`Kitchen stock with id ${orderItem.kitchen_stock.id} not found`);
      }

      const newQuantity = Number(kitchenStock.quantity) - Number(orderItem.quantity);
      const newTotalPrice = Number(kitchenStock.total_price || 0) - Number(orderItem.total_price);

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock for ${kitchenStock.kitchen_item?.name || 'item'}. Available: ${kitchenStock.quantity}, Required: ${orderItem.quantity}`
        );
      }

      kitchenStock.quantity = newQuantity;
      kitchenStock.total_price = Math.max(0, newTotalPrice);
      kitchenStock.updated_at = new Date();

      await this.kitchenStockRepository.save(kitchenStock);
    }
  }

  async remove(id: string): Promise<void> {
    await this.kitchenOrderItemRepository.delete({ kitchen_order: { id } });
    
    const result = await this.kitchenOrderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Kitchen order with id ${id} not found`);
    }
    await this.invalidateCache();
  }

  private async invalidateCache(): Promise<void> {
    await this.cacheService.delete('kitchen-orders:*');
  }
}