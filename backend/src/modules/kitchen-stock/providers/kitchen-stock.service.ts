import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { KitchenStock } from "../entities/kitchen-stock.entity";
import { KitchenItems } from "../../kitchen-items/entities/kitchen-item.entity";
import { CreateKitchenStockDto } from "../dto/kitchen-stock-create.dto";
import { UpdateKitchenStockDto } from "../dto/kitchen-stock-update.dto";
import { KitchenStockResponseDto } from "../dto/kitchen-stock-response.dto";

@Injectable()
export class KitchenStockService {
  constructor(
    @InjectRepository(KitchenStock)
    private readonly kitchenStockRepository: Repository<KitchenStock>,
    @InjectRepository(KitchenItems)
    private readonly kitchenItemsRepository: Repository<KitchenItems>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    itemId?: string
  ): Promise<{ data: KitchenStockResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const whereCondition = itemId ? { kitchen_item: { id: itemId } } : {};
    
    const [stocks, total] = await this.kitchenStockRepository.findAndCount({
      where: whereCondition,
      relations: ['kitchen_item'],
      skip,
      take: limit,
      order: { created_at: 'DESC' }
    });
    
    const data = stocks.map(stock => new KitchenStockResponseDto(stock));
    return { data, total };
  }

  async findOne(id: string): Promise<KitchenStockResponseDto> {
    const stock = await this.kitchenStockRepository.findOne({ 
      where: { id },
      relations: ['kitchen_item']
    });
    if (!stock) {
      throw new NotFoundException(`Kitchen stock with id ${id} not found`);
    }
    return new KitchenStockResponseDto(stock);
  }

  async findByItemId(itemId: string): Promise<KitchenStockResponseDto[]> {
    const stocks = await this.kitchenStockRepository.find({ 
      where: { kitchen_item: { id: itemId } },
      relations: ['kitchen_item']
    });
    return stocks.map(stock => new KitchenStockResponseDto(stock));
  }

  async create(createKitchenStockDto: CreateKitchenStockDto): Promise<KitchenStockResponseDto> {
    const kitchenItem = await this.kitchenItemsRepository.findOne({
      where: { id: createKitchenStockDto.kitchen_item_id },
    });

    if (!kitchenItem) {
      throw new NotFoundException(`Kitchen item with id ${createKitchenStockDto.kitchen_item_id} not found`);
    }

    // Calculate total price
    const totalPrice = Number(createKitchenStockDto.price) * Number(createKitchenStockDto.quantity);
    createKitchenStockDto.total_price = totalPrice;

    const stock = this.kitchenStockRepository.create({
      ...createKitchenStockDto,
      kitchen_item: kitchenItem,
      created_at: new Date(),
    });
    const savedStock = await this.kitchenStockRepository.save(stock);
    return new KitchenStockResponseDto(savedStock);
  }

  async update(id: string, updateKitchenStockDto: UpdateKitchenStockDto): Promise<KitchenStockResponseDto> {
    const stock = await this.kitchenStockRepository.findOne({ 
      where: { id },
      relations: ['kitchen_item']
    });

    if (!stock) {
      throw new NotFoundException(`Kitchen stock with id ${id} not found`);
    }

    if (updateKitchenStockDto.kitchen_item_id) {
      const kitchenItem = await this.kitchenItemsRepository.findOne({
        where: { id: updateKitchenStockDto.kitchen_item_id },
      });
      if (!kitchenItem) {
        throw new NotFoundException(`Kitchen item with id ${updateKitchenStockDto.kitchen_item_id} not found`);
      }
      stock.kitchen_item = kitchenItem;
    }

    // Calculate total price
    if (updateKitchenStockDto.price && updateKitchenStockDto.quantity) {
      const totalPrice = Number(updateKitchenStockDto.price) * Number(updateKitchenStockDto.quantity);
      updateKitchenStockDto.total_price = totalPrice;
    }

    Object.assign(stock, {
      ...updateKitchenStockDto,
      updated_at: new Date(),
    });
    const updatedStock = await this.kitchenStockRepository.save(stock);
    return new KitchenStockResponseDto(updatedStock);
  }

  async remove(id: string): Promise<void> {
    const result = await this.kitchenStockRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Kitchen stock with id ${id} not found`);
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<KitchenStockResponseDto> {
    const stock = await this.kitchenStockRepository.findOne({ 
      where: { id },
      relations: ['kitchen_item']
    });
    if (!stock) {
      throw new NotFoundException(`Kitchen stock with id ${id} not found`);
    }
    
    stock.quantity = quantity;
    stock.updated_at = new Date();
    const updatedStock = await this.kitchenStockRepository.save(stock);
    return new KitchenStockResponseDto(updatedStock);
  }
}