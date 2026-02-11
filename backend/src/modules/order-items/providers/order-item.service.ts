import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderItemDto } from '../dto/order-item-create.dto';
import { UpdateOrderItemDto } from '../dto/order-item-update.dto';
import { OrderItemResponseDto } from '../dto/order-item-response.dto';
import { Item } from 'src/modules/items/entities/item.entity';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(dto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    const itemId = dto.item_id || dto.item?.id;
    const item = await this.findItem(itemId);

    const orderItem = this.orderItemRepository.create({
      ...dto,
      item,
      total_price: dto.unit_price * dto.quantity,
    });

    const saved = await this.orderItemRepository.save(orderItem);

    return this.mapToResponseDto(saved);
  }

  async findAll(): Promise<OrderItemResponseDto[]> {
    const items = await this.orderItemRepository.find({ relations: ['item'] });
    return items.map(item => this.mapToResponseDto(item));
  }

  async findOne(id: string): Promise<OrderItemResponseDto> {
    const item = await this.orderItemRepository.findOne({ where: { id }, relations: ['item'] });
    if (!item) throw new NotFoundException(`Order item with ID ${id} not found`);
    return this.mapToResponseDto(item);
  }

  async findByOrderId(orderId: string): Promise<OrderItemResponseDto[]> {
    const items = await this.orderItemRepository.find({
      where: { order: { id: orderId } },
      relations: ['item', 'order'],
    });
    return items.map(item => this.mapToResponseDto(item));
  }

  async update(id: string, dto: UpdateOrderItemDto): Promise<OrderItemResponseDto> {
    const orderItem = await this.findEntityById(id);

    if (dto.item?.id) {
      orderItem.item = await this.findItem(dto.item.id);
    }

    Object.assign(orderItem, dto);

    if (dto.unit_price || dto.quantity) {
      const quantity = dto.quantity ?? orderItem.quantity;
      const unit_price = dto.unit_price ?? orderItem.unit_price;
      orderItem.total_price = unit_price * quantity;
    }

    const updated = await this.orderItemRepository.save(orderItem);
    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const orderItem = await this.findEntityById(id);
    await this.orderItemRepository.remove(orderItem);
  }

  private async findEntityById(id: string): Promise<OrderItem> {
    const entity = await this.orderItemRepository.findOne({ where: { id }, relations: ['item'] });
    if (!entity) throw new NotFoundException(`Order item with ID ${id} not found`);
    return entity;
  }

  private async findItem(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);
    return item;
  }

  private mapToResponseDto(orderItem: OrderItem): OrderItemResponseDto {
    const dto = new OrderItemResponseDto({});
    dto.id = orderItem.id;
    dto.quantity = orderItem.quantity;
    dto.unit_price = orderItem.unit_price;
    dto.total_price = orderItem.total_price;
    dto.item = orderItem.item;
    dto.order = orderItem.order;
    dto.order_id = orderItem.order?.id;
    dto.created_at = orderItem.created_at;
    dto.updated_at = orderItem.updated_at;
    return dto;
  }
}
