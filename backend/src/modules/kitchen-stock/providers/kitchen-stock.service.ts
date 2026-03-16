import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitchenStock } from '../entities/kitchen-stock.entity';
import { KitchenItems } from '../../kitchen-items/entities/kitchen-item.entity';
import { CreateKitchenStockDto } from '../dto/create-kitchen-stock.dto';
import { UpdateKitchenStockDto } from '../dto/update-kitchen-stock.dto';
import { KitchenStockResponseDto, StockSummaryItemDto } from '../dto/kitchen-stock-response.dto';
import { KitchenItemType } from '../../kitchen-items/enum/kitchen-item-type.enum';

@Injectable()
export class KitchenStockService {
  constructor(
    @InjectRepository(KitchenStock)
    private readonly stockRepo: Repository<KitchenStock>,
    @InjectRepository(KitchenItems)
    private readonly kitchenItemRepo: Repository<KitchenItems>,
  ) {}

  async create(dto: CreateKitchenStockDto): Promise<KitchenStockResponseDto> {
    const item = await this.kitchenItemRepo.findOne({ where: { id: dto.kitchen_item_id } });
    if (!item) throw new NotFoundException('Kitchen item not found');

    const entry = this.stockRepo.create(dto);
    const saved = await this.stockRepo.save(entry);
    return this.toResponse(saved, item);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: KitchenItemType;
    kitchen_item_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: KitchenStockResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 20, type, kitchen_item_id, start_date, end_date } = params;
    const skip = (page - 1) * limit;

    const qb = this.stockRepo
      .createQueryBuilder('ks')
      .leftJoinAndSelect('ks.kitchen_item', 'ki')
      .where('ks.deleted_at IS NULL')
      .orderBy('ks.purchase_date', 'DESC')
      .addOrderBy('ks.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (type) {
      qb.andWhere('ki.type = :type', { type });
    }
    if (kitchen_item_id) {
      qb.andWhere('ks.kitchen_item_id = :kitchen_item_id', { kitchen_item_id });
    }
    if (start_date) {
      qb.andWhere('ks.purchase_date >= :start_date', { start_date });
    }
    if (end_date) {
      qb.andWhere('ks.purchase_date <= :end_date', { end_date });
    }

    const [entries, total] = await qb.getManyAndCount();
    const data = entries.map(e => this.toResponse(e, e.kitchen_item));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<KitchenStockResponseDto> {
    const entry = await this.stockRepo.findOne({
      where: { id },
      relations: ['kitchen_item'],
    });
    if (!entry) throw new NotFoundException('Stock entry not found');
    return this.toResponse(entry, entry.kitchen_item);
  }

  async update(id: string, dto: UpdateKitchenStockDto): Promise<KitchenStockResponseDto> {
    const entry = await this.stockRepo.findOne({ where: { id }, relations: ['kitchen_item'] });
    if (!entry) throw new NotFoundException('Stock entry not found');

    if (dto.kitchen_item_id && dto.kitchen_item_id !== entry.kitchen_item_id) {
      const item = await this.kitchenItemRepo.findOne({ where: { id: dto.kitchen_item_id } });
      if (!item) throw new NotFoundException('Kitchen item not found');
    }

    Object.assign(entry, dto);
    const saved = await this.stockRepo.save(entry);
    const updated = await this.stockRepo.findOne({ where: { id: saved.id }, relations: ['kitchen_item'] });
    return this.toResponse(updated!, updated!.kitchen_item);
  }

  async softDelete(id: string): Promise<void> {
    const entry = await this.stockRepo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Stock entry not found');
    await this.stockRepo.softDelete(id);
  }

  async getStockSummary(type?: KitchenItemType): Promise<StockSummaryItemDto[]> {
    const qb = this.kitchenItemRepo
      .createQueryBuilder('ki')
      .leftJoin(
        subQuery =>
          subQuery
            .select('s.kitchen_item_id', 'kitchen_item_id')
            .addSelect('SUM(s.quantity)', 'total_quantity')
            .addSelect('SUM(s.quantity * s.purchase_price)', 'total_value')
            .from(KitchenStock, 's')
            .where('s.deleted_at IS NULL')
            .groupBy('s.kitchen_item_id'),
        'agg',
        'agg.kitchen_item_id = ki.id',
      )
      .select('ki.id', 'kitchen_item_id')
      .addSelect('ki.name', 'name')
      .addSelect('ki.type', 'type')
      .addSelect('ki.low_stock_threshold', 'low_stock_threshold')
      .addSelect('COALESCE(agg.total_quantity, 0)', 'total_quantity')
      .addSelect('COALESCE(agg.total_value, 0)', 'total_value')
      .where('ki.deleted_at IS NULL')
      .orderBy('ki.name', 'ASC');

    if (type) {
      qb.andWhere('ki.type = :type', { type });
    }

    const rows = await qb.getRawMany();

    return rows.map(r => ({
      kitchen_item_id: r.kitchen_item_id,
      name: r.name,
      type: r.type,
      total_quantity: parseFloat(r.total_quantity) || 0,
      total_value: parseFloat(r.total_value) || 0,
      low_stock_threshold: r.low_stock_threshold ? parseInt(r.low_stock_threshold) : null,
      is_low_stock:
        r.low_stock_threshold !== null &&
        (parseFloat(r.total_quantity) || 0) < parseInt(r.low_stock_threshold),
    }));
  }

  async getLowStockAlerts(): Promise<StockSummaryItemDto[]> {
    const summary = await this.getStockSummary();
    return summary.filter(item => item.is_low_stock);
  }

  private toResponse(entry: KitchenStock, item: KitchenItems): KitchenStockResponseDto {
    return {
      id: entry.id,
      kitchen_item_id: entry.kitchen_item_id,
      kitchen_item: item
        ? { id: item.id, name: item.name, type: item.type }
        : { id: entry.kitchen_item_id, name: '', type: '' },
      quantity: parseFloat(entry.quantity as unknown as string),
      purchase_price: parseFloat(entry.purchase_price as unknown as string),
      purchase_date: entry.purchase_date,
      note: entry.note,
      deleted_at: entry.deleted_at,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    };
  }
}
