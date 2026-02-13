import { Injectable, BadRequestException } from '@nestjs/common';
import { ItemService } from '../../items/providers/item.service';
import { CategoryService } from '../../categories/providers/category.service';
import { TableService } from '../../table/providers/table.service';
import { ItemStatus } from '../../items/enum/item-status.enum';
import { BlogService } from '../../blog/blog.service';
import { ReservationsService } from '../../reservations/reservations.service';
import { PartnersService } from '../../partners/partners.service';
import { SettingsService } from '../../settings/settings.service';
import { CreateReservationDto } from '../../reservations/dto/create-reservation.dto';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

@Injectable()
export class PublicService {
  constructor(
    private readonly itemService: ItemService,
    private readonly categoryService: CategoryService,
    private readonly tableService: TableService,
    private readonly blogService: BlogService,
    private readonly reservationsService: ReservationsService,
    private readonly partnersService: PartnersService,
    private readonly settingsService: SettingsService,
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

  // Blog

  async getPublishedBlogPosts(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: BlogPost[]; total: number }> {
    return this.blogService.findPublished(options);
  }

  async getPublishedBlogPostBySlug(slug: string): Promise<BlogPost> {
    return this.blogService.findPublishedBySlug(slug);
  }

  // Reservations

  async createReservation(dto: CreateReservationDto): Promise<Reservation> {
    const enabled = await this.settingsService.isReservationEnabled();
    if (!enabled) {
      throw new BadRequestException('Reservations are currently disabled');
    }
    return this.reservationsService.create(dto);
  }

  async isReservationEnabled(): Promise<boolean> {
    return this.settingsService.isReservationEnabled();
  }

  // Partners

  async getActivePartners(): Promise<Partner[]> {
    return this.partnersService.findActive();
  }
}
