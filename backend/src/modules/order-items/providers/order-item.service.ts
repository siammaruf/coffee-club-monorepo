import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderItemDto } from '../dto/order-item-create.dto';
import { UpdateOrderItemDto } from '../dto/order-item-update.dto';
import { OrderItemResponseDto } from '../dto/order-item-response.dto';
import { Item } from 'src/modules/items/entities/item.entity';
import { ItemVariation } from 'src/modules/items/entities/item-variation.entity';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemVariation)
    private readonly itemVariationRepository: Repository<ItemVariation>,
  ) {}

  async create(dto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    const itemId = dto.item_id || dto.item?.id;
    const item = await this.findItem(itemId);

    let variation: ItemVariation | null = null;
    if (dto.item_variation_id) {
      variation = await this.findVariation(dto.item_variation_id);
    }

    const orderItem = this.orderItemRepository.create({
      ...dto,
      item,
      variation,
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

    if (dto.item_variation_id) {
      orderItem.variation = await this.findVariation(dto.item_variation_id);
    } else if (dto.item_variation_id === null) {
      orderItem.variation = null;
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
    await this.orderItemRepository.softDelete(id);
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

  private async findVariation(id: string): Promise<ItemVariation> {
    const variation = await this.itemVariationRepository.findOne({ where: { id } });
    if (!variation) throw new NotFoundException(`Item variation with ID ${id} not found`);
    return variation;
  }

  private mapToResponseDto(orderItem: OrderItem): OrderItemResponseDto {
    const dto = new OrderItemResponseDto({});
    dto.id = orderItem.id;
    dto.quantity = orderItem.quantity;
    dto.unit_price = orderItem.unit_price;
    dto.total_price = orderItem.total_price;
    dto.item = orderItem.item;
    dto.item_variation_id = orderItem.variation?.id ?? undefined;
    dto.order = orderItem.order;
    dto.order_id = orderItem.order?.id;
    dto.created_at = orderItem.created_at;
    dto.updated_at = orderItem.updated_at;
    return dto;
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.orderItemRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.orderItemRepository.createQueryBuilder('orderItem')
            .withDeleted()
            .where('orderItem.deleted_at IS NOT NULL');

        query.orderBy('orderItem.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.orderItemRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.orderItemRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.orderItemRepository.delete(id);
    }
}
