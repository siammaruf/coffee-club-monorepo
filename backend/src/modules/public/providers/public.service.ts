import { Injectable, BadRequestException } from '@nestjs/common';
import { ItemService } from '../../items/providers/item.service';
import { CategoryService } from '../../categories/providers/category.service';
import { TableService } from '../../table/providers/table.service';
import { ItemStatus } from '../../items/enum/item-status.enum';
import { BlogService } from '../../blog/blog.service';
import { ReservationsService } from '../../reservations/reservations.service';
import { PartnersService } from '../../partners/partners.service';
import { SettingsService } from '../../settings/settings.service';
import { WebsiteContentService } from '../../website-content/website-content.service';
import { ContactMessagesService } from '../../contact-messages/contact-messages.service';
import { CreateReservationDto } from '../../reservations/dto/create-reservation.dto';
import { CreateContactMessageDto } from '../../contact-messages/dto/create-contact-message.dto';
import { BlogPost } from '../../blog/entities/blog-post.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { ContactMessage } from '../../contact-messages/entities/contact-message.entity';

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
    private readonly websiteContentService: WebsiteContentService,
    private readonly contactMessagesService: ContactMessagesService,
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

  // Contact Messages

  async submitContactMessage(dto: CreateContactMessageDto): Promise<ContactMessage> {
    return this.contactMessagesService.create(dto);
  }

  // Website Content

  async getWebsiteContent() {
    const [heroSlides, advantages, testimonials, settings] = await Promise.all([
      this.websiteContentService.findAllActiveHeroSlides(),
      this.websiteContentService.findAllActiveAdvantages(),
      this.websiteContentService.findAllActiveTestimonials(),
      this.websiteContentService.getWebsiteSettings(),
    ]);

    return {
      heroSlides,
      advantages,
      testimonials,
      settings: {
        phone: settings.website_phone ?? '+1 215 456 15 15',
        hours: settings.website_hours ?? '8:00 am \u2013 11:30 pm',
        social: {
          twitter: settings.website_social_twitter ?? '',
          facebook: settings.website_social_facebook ?? '',
          instagram: settings.website_social_instagram ?? '',
        },
        newsletter: {
          title: settings.website_newsletter_title ?? 'Subscribe for Our Newsletter',
          subtitle: settings.website_newsletter_subtitle ?? '',
        },
        about: {
          title: settings.website_about_title ?? 'We Are CoffeeClub',
          description: settings.website_about_description ?? '',
          subtitle: settings.website_about_subtitle ?? '',
          paragraph1: settings.website_about_paragraph1 ?? '',
          paragraph2: settings.website_about_paragraph2 ?? '',
        },
      },
    };
  }
}
