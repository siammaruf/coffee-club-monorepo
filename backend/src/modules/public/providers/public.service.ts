import { Injectable } from '@nestjs/common';
import { ItemService } from '../../items/providers/item.service';
import { CategoryService } from '../../categories/providers/category.service';
import { TableService } from '../../table/providers/table.service';
import { ItemStatus } from '../../items/enum/item-status.enum';

@Injectable()
export class PublicService {
  constructor(
    private readonly itemService: ItemService,
    private readonly categoryService: CategoryService,
    private readonly tableService: TableService,
  ) {}

  async getCategories(options: { page: number; limit: number; search?: string }) {
    return this.categoryService.findAll(options);
  }

  async getItems(options: {
    page: number;
    limit: number;
    search?: string;
    categorySlug?: string;
  }) {
    // Use existing ItemService but only return available items
    const result = await this.itemService.findAll({
      page: options.page,
      limit: options.limit,
      search: options.search,
      categorySlug: options.categorySlug,
    });

    // Filter to only include available items (AVAILABLE and ON_SALE)
    const availableItems = result.data.filter(
      (item) =>
        item.status === ItemStatus.AVAILABLE || item.status === ItemStatus.ON_SALE,
    );

    return {
      data: availableItems,
      total: availableItems.length,
    };
  }

  async getItem(id: string) {
    return this.itemService.findOne(id);
  }

  async getAvailableTables() {
    return this.tableService.getAvailableTables();
  }
}
