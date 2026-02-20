import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { Advantage } from './entities/advantage.entity';
import { Testimonial } from './entities/testimonial.entity';
import { SettingsService } from '../settings/settings.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { CreateAdvantageDto } from './dto/create-advantage.dto';
import { UpdateAdvantageDto } from './dto/update-advantage.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class WebsiteContentService implements OnModuleInit {
  private readonly logger = new Logger(WebsiteContentService.name);

  constructor(
    @InjectRepository(HeroSlide)
    private readonly heroSlideRepository: Repository<HeroSlide>,
    @InjectRepository(Advantage)
    private readonly advantageRepository: Repository<Advantage>,
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly settingsService: SettingsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
  }

  // =====================
  // Hero Slides CRUD
  // =====================

  async createHeroSlide(dto: CreateHeroSlideDto): Promise<HeroSlide> {
    const image = await this.cloudinaryService.ensureCloudinaryUrl(
      dto.image || null,
      'coffee-club/website-content',
    );

    const slide = this.heroSlideRepository.create({
      ...dto,
      image,
      subtitle: dto.subtitle || null,
      heading: dto.heading || null,
    });
    return this.heroSlideRepository.save(slide);
  }

  async findAllHeroSlides(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: HeroSlide[]; total: number }> {
    const { page, limit, search } = options;

    const query = this.heroSlideRepository.createQueryBuilder('slide');

    if (search) {
      query.andWhere(
        '(LOWER(slide.title) LIKE :search OR LOWER(slide.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('slide.sort_order', 'ASC')
      .addOrderBy('slide.created_at', 'DESC')
      .addOrderBy('slide.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOneHeroSlide(id: string): Promise<HeroSlide> {
    const slide = await this.heroSlideRepository.findOne({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Hero slide with ID ${id} not found`);
    }
    return slide;
  }

  async updateHeroSlide(id: string, dto: UpdateHeroSlideDto): Promise<HeroSlide> {
    const slide = await this.findOneHeroSlide(id);

    if (dto.type !== undefined) slide.type = dto.type;
    if (dto.image !== undefined) {
      slide.image = await this.cloudinaryService.ensureCloudinaryUrl(
        dto.image || null,
        'coffee-club/website-content',
      );
    }
    if (dto.title !== undefined) slide.title = dto.title;
    if (dto.subtitle !== undefined) slide.subtitle = dto.subtitle || null;
    if (dto.heading !== undefined) slide.heading = dto.heading || null;
    if (dto.description !== undefined) slide.description = dto.description;
    if (dto.show_cta !== undefined) slide.show_cta = dto.show_cta;
    if (dto.bg_image !== undefined) slide.bg_image = dto.bg_image;
    if (dto.sort_order !== undefined) slide.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) slide.is_active = dto.is_active;

    return this.heroSlideRepository.save(slide);
  }

  async removeHeroSlide(id: string): Promise<void> {
    const slide = await this.findOneHeroSlide(id);
    await this.heroSlideRepository.remove(slide);
  }

  async findAllActiveHeroSlides(): Promise<HeroSlide[]> {
    return this.heroSlideRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  // =====================
  // Advantages CRUD
  // =====================

  async createAdvantage(dto: CreateAdvantageDto): Promise<Advantage> {
    const icon = await this.cloudinaryService.ensureCloudinaryUrl(
      dto.icon || null,
      'coffee-club/website-content',
    );

    const advantage = this.advantageRepository.create({
      ...dto,
      icon,
    });
    return this.advantageRepository.save(advantage);
  }

  async findAllAdvantages(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: Advantage[]; total: number }> {
    const { page, limit, search } = options;

    const query = this.advantageRepository.createQueryBuilder('advantage');

    if (search) {
      query.andWhere(
        '(LOWER(advantage.title) LIKE :search OR LOWER(advantage.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('advantage.sort_order', 'ASC')
      .addOrderBy('advantage.created_at', 'DESC')
      .addOrderBy('advantage.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOneAdvantage(id: string): Promise<Advantage> {
    const advantage = await this.advantageRepository.findOne({ where: { id } });
    if (!advantage) {
      throw new NotFoundException(`Advantage with ID ${id} not found`);
    }
    return advantage;
  }

  async updateAdvantage(id: string, dto: UpdateAdvantageDto): Promise<Advantage> {
    const advantage = await this.findOneAdvantage(id);

    if (dto.icon !== undefined) {
      advantage.icon = await this.cloudinaryService.ensureCloudinaryUrl(
        dto.icon || null,
        'coffee-club/website-content',
      );
    }
    if (dto.title !== undefined) advantage.title = dto.title;
    if (dto.description !== undefined) advantage.description = dto.description;
    if (dto.sort_order !== undefined) advantage.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) advantage.is_active = dto.is_active;

    return this.advantageRepository.save(advantage);
  }

  async removeAdvantage(id: string): Promise<void> {
    const advantage = await this.findOneAdvantage(id);
    await this.advantageRepository.remove(advantage);
  }

  async findAllActiveAdvantages(): Promise<Advantage[]> {
    return this.advantageRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  // =====================
  // Testimonials CRUD
  // =====================

  async createTestimonial(dto: CreateTestimonialDto): Promise<Testimonial> {
    const image = await this.cloudinaryService.ensureCloudinaryUrl(
      dto.image || null,
      'coffee-club/website-content',
    );

    const testimonial = this.testimonialRepository.create({
      ...dto,
      image,
    });
    return this.testimonialRepository.save(testimonial);
  }

  async findAllTestimonials(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: Testimonial[]; total: number }> {
    const { page, limit, search } = options;

    const query = this.testimonialRepository.createQueryBuilder('testimonial');

    if (search) {
      query.andWhere(
        '(LOWER(testimonial.name) LIKE :search OR LOWER(testimonial.quote) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('testimonial.sort_order', 'ASC')
      .addOrderBy('testimonial.created_at', 'DESC')
      .addOrderBy('testimonial.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOneTestimonial(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async updateTestimonial(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOneTestimonial(id);

    if (dto.quote !== undefined) testimonial.quote = dto.quote;
    if (dto.image !== undefined) {
      testimonial.image = await this.cloudinaryService.ensureCloudinaryUrl(
        dto.image || null,
        'coffee-club/website-content',
      );
    }
    if (dto.name !== undefined) testimonial.name = dto.name;
    if (dto.position !== undefined) testimonial.position = dto.position;
    if (dto.sort_order !== undefined) testimonial.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) testimonial.is_active = dto.is_active;

    return this.testimonialRepository.save(testimonial);
  }

  async removeTestimonial(id: string): Promise<void> {
    const testimonial = await this.findOneTestimonial(id);
    await this.testimonialRepository.remove(testimonial);
  }

  async findAllActiveTestimonials(): Promise<Testimonial[]> {
    return this.testimonialRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  // =====================
  // Website Settings
  // =====================

  async getWebsiteSettings(): Promise<Record<string, string>> {
    const allSettings = await this.settingsService.getAllSettings();
    const websiteSettings: Record<string, string> = {};

    for (const setting of allSettings) {
      if (setting.key.startsWith('website_')) {
        websiteSettings[setting.key] = setting.value;
      }
    }

    return websiteSettings;
  }

  async updateWebsiteSettings(data: Record<string, string>): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('website_')) {
        await this.settingsService.setSetting(key, value);
      }
    }
    return this.getWebsiteSettings();
  }

  // =====================
  // Seed Defaults
  // =====================

  private async seedDefaults(): Promise<void> {
    await this.seedHeroSlides();
    await this.seedAdvantages();
    await this.seedTestimonials();
    await this.seedWebsiteSettings();
  }

  private async seedHeroSlides(): Promise<void> {
    const count = await this.heroSlideRepository.count();
    if (count > 0) return;

    const defaults: Partial<HeroSlide>[] = [
      {
        type: 'centered',
        image: '/img/pizza_1.png',
        title: 'CoffeeClub',
        description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
        sort_order: 0,
      },
      {
        type: 'side-text',
        image: '/img/pizza_2.png',
        title: 'CoffeeClub Pizza.',
        heading: 'Making people happy',
        description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
        show_cta: true,
        sort_order: 1,
      },
      {
        type: 'side-text',
        image: '/img/pizza_3.png',
        title: 'CoffeeClub Pizza.',
        heading: 'Making people happy',
        description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
        show_cta: true,
        sort_order: 2,
      },
      {
        type: 'bg-image',
        image: '/img/slide_2.jpg',
        title: 'CoffeeClub Pizza.',
        heading: 'Making people happy',
        description: 'Italian Pizza With Cherry Tomatoes and Green Basil',
        show_cta: true,
        bg_image: true,
        sort_order: 3,
      },
    ];

    for (const def of defaults) {
      const slide = this.heroSlideRepository.create(def);
      await this.heroSlideRepository.save(slide);
    }
    this.logger.log('Seeded default hero slides');
  }

  private async seedAdvantages(): Promise<void> {
    const count = await this.advantageRepository.count();
    if (count > 0) return;

    const defaults: Partial<Advantage>[] = [
      {
        icon: '/img/icon_1.png',
        title: 'Quality Foods',
        description: 'Sit amet, consectetur adipiscing elit eiusmod tempor incididunt ut labore et dolore.',
        sort_order: 0,
      },
      {
        icon: '/img/icon_3.png',
        title: 'Fastest Delivery',
        description: 'Sit amet, consectetur adipiscing elit eiusmod tempor incididunt ut labore et dolore.',
        sort_order: 1,
      },
      {
        icon: '/img/icon_2.png',
        title: 'Original Recipes',
        description: 'Sit amet, consectetur adipiscing elit eiusmod tempor incididunt ut labore et dolore.',
        sort_order: 2,
      },
    ];

    for (const def of defaults) {
      const advantage = this.advantageRepository.create(def);
      await this.advantageRepository.save(advantage);
    }
    this.logger.log('Seeded default advantages');
  }

  private async seedTestimonials(): Promise<void> {
    const count = await this.testimonialRepository.count();
    if (count > 0) return;

    const defaults: Partial<Testimonial>[] = [
      {
        quote: 'CoffeeClub was one of the first restaurants I visited when I moved to New York.',
        image: '/img/testimonial_1-200x200.jpg',
        name: 'Adam Jefferson',
        position: 'Lawyer, New York',
        sort_order: 0,
      },
      {
        quote: 'The pasta here is incredible. I come back every week with my family.',
        image: '/img/testimonial_2-200x200.jpg',
        name: 'Sara Mitchell',
        position: 'Designer, Boston',
        sort_order: 1,
      },
    ];

    for (const def of defaults) {
      const testimonial = this.testimonialRepository.create(def);
      await this.testimonialRepository.save(testimonial);
    }
    this.logger.log('Seeded default testimonials');
  }

  private async seedWebsiteSettings(): Promise<void> {
    const defaults: { key: string; value: string; description: string }[] = [
      { key: 'website_phone', value: '+1 215 456 15 15', description: 'Website contact phone number' },
      { key: 'website_hours', value: '8:00 am \u2013 11:30 pm', description: 'Business hours display' },
      { key: 'website_social_twitter', value: 'https://twitter.com/', description: 'Twitter profile URL' },
      { key: 'website_social_facebook', value: 'https://www.facebook.com/', description: 'Facebook page URL' },
      { key: 'website_social_instagram', value: 'https://www.instagram.com/', description: 'Instagram profile URL' },
      { key: 'website_newsletter_title', value: 'Subscribe for Our Newsletter', description: 'Newsletter section title' },
      { key: 'website_newsletter_subtitle', value: '', description: 'Newsletter section subtitle' },
      { key: 'website_about_title', value: 'We Are CoffeeClub', description: 'About section title' },
      { key: 'website_about_subtitle', value: "We don't just make coffee, we craft experiences", description: 'About section subtitle' },
      { key: 'website_about_paragraph1', value: 'Located in the heart of the city, CoffeeClub has been serving premium coffee and delicious food since 2010. Our passion for quality ingredients and exceptional service has made us a favorite destination for food lovers.', description: 'About section first paragraph' },
      { key: 'website_about_paragraph2', value: 'Every dish on our menu is prepared with the freshest ingredients, sourced locally whenever possible. Our team of talented chefs brings creativity and expertise to every plate, ensuring an unforgettable dining experience.', description: 'About section second paragraph' },
      { key: 'website_about_description', value: 'Located in the heart of the city, CoffeeClub has been serving premium coffee and delicious food since 2010. Our passion for quality ingredients and exceptional service has made us a favorite destination for food lovers.\n\nEvery dish on our menu is prepared with the freshest ingredients, sourced locally whenever possible. Our team of talented chefs brings creativity and expertise to every plate, ensuring an unforgettable dining experience.', description: 'About page full description text' },
    ];

    for (const def of defaults) {
      const existing = await this.settingsService.getSetting(def.key);
      if (existing === null) {
        await this.settingsService.setSetting(def.key, def.value, def.description);
        this.logger.log(`Seeded website setting: ${def.key}`);
      }
    }
  }
}
