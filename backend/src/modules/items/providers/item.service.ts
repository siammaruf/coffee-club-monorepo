import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Not } from "typeorm";
import { Item } from "../entities/item.entity";
import { ItemVariation } from "../entities/item-variation.entity";
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from "../dto/update-item.dto";
import { Category } from "../../categories/entities/category.entity";
import { generateSlug } from "../../../common/utils/string-utils";
import { CloudinaryService } from "../../cloudinary/cloudinary.service";
import { CacheService } from "../../cache/cache.service";

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ItemVariation)
    private readonly variationRepository: Repository<ItemVariation>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(options: { page: number, limit: number, search?: string, categoryId?: string, categorySlug?: string, type?: string, status?: string, statuses?: string[] }) {
    const cacheKey = `items:findAll:${JSON.stringify(options)}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as { data: Item[], total: number };
    }

    const { page, limit, search, categoryId, categorySlug, type, status, statuses } = options;
    const query = this.itemRepository.createQueryBuilder('item')
      .leftJoin('item.categories', 'category')
      .addSelect([
        'category.id',
        'category.name',
        'category.slug',
        'category.name_bn'
      ]);

    if (categoryId) {
      query.andWhere('category.id = :categoryId', { categoryId });
    } else if (categorySlug) {
      query.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (type) {
      query.andWhere('item.type = :type', { type });
    }

    if (status) {
      query.andWhere('item.status = :status', { status });
    }

    if (statuses && statuses.length > 0) {
      query.andWhere('item.status IN (:...statuses)', { statuses });
    }

    if (search) {
      query.andWhere('(LOWER(item.name) LIKE :search OR LOWER(item.name_bn) LIKE :search OR LOWER(item.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` });
    }

    query.leftJoinAndSelect('item.categories', 'categorySelect')
      .leftJoinAndSelect('item.variations', 'variation')
      .orderBy('item.created_at', 'DESC')
      .addOrderBy('variation.sort_order', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    const filteredData = data.map(item => item);
    const result = { data: filteredData, total };

    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: string): Promise<Item> {
    const cacheKey = `items:findOne:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as Item;
    }

    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['categories', 'variations']
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    await this.cacheService.set(cacheKey, item, 3600);
    return item;
  }

  async findBySlug(slug: string): Promise<Item> {
    const cacheKey = `items:findBySlug:${slug}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as Item;
    }

    const item = await this.itemRepository.findOne({
      where: { slug },
      relations: ['categories', 'variations']
    });

    if (!item) {
      throw new NotFoundException(`Item with slug "${slug}" not found`);
    }

    await this.cacheService.set(cacheKey, item, 3600);
    return item;
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    if (Array.isArray(createItemDto)) {
      throw new BadRequestException("createItemDto should not be an array");
    }

    const existing = await this.itemRepository.findOne({ where: { name: createItemDto.name } });
    if (existing) {
      throw new ConflictException("Item with this name already exists");
    }

    const baseSlug = generateSlug(createItemDto.name);
    let slug = baseSlug;

    let counter = 0;
    while (await this.slugExists(slug)) {
      counter++;
      slug = `${baseSlug}${counter}`;
    }

    createItemDto.slug = slug;

    let categories: Category[] = [];

    if (createItemDto.categories && Array.isArray(createItemDto.categories)) {
      if (typeof createItemDto.categories[0] === 'string') {
        categories = await this.categoryRepository.find({
          where: { id: In((createItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
        });

        if (categories.length !== createItemDto.categories.length) {
          throw new NotFoundException("One or more category IDs are invalid");
        }
      } else {
        categories = await this.categoryRepository.find({
          where: { id: In((createItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
        });
      }
    } else if (createItemDto.categories && typeof createItemDto.categories === 'string') {
      const categoryId = createItemDto.categories as string;
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
      categories = [category];
    } else {
      throw new BadRequestException("Categories must be provided as an array of category IDs");
    }

    const item = this.itemRepository.create({
      ...createItemDto,
      categories: categories,
    });

    const savedItem = await this.itemRepository.save(item);

    // Handle variations
    if (createItemDto.has_variations && createItemDto.variations && createItemDto.variations.length > 0) {
      const variations = createItemDto.variations.map(v => this.variationRepository.create({
        name: v.name,
        name_bn: v.name_bn,
        regular_price: v.regular_price,
        sale_price: v.sale_price ?? null,
        status: v.status,
        sort_order: v.sort_order ?? 0,
        item_id: savedItem.id,
      }));
      savedItem.variations = await this.variationRepository.save(variations);
    }

    await this.invalidateCache();
    return savedItem;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);

    if (updateItemDto.name && updateItemDto.name !== item.name) {
      const baseSlug = generateSlug(updateItemDto.name);
      let slug = baseSlug;

      let counter = 0;
      while (await this.slugExistsExcept(slug, id)) {
        counter++;
        slug = `${baseSlug}${counter}`;
      }

      updateItemDto.slug = slug;
    } else if (updateItemDto.slug && updateItemDto.slug !== item.slug) {
      if (await this.slugExistsExcept(updateItemDto.slug, id)) {
        throw new ConflictException("Item with this slug already exists");
      }
    }

    if (updateItemDto.name) item.name = updateItemDto.name;
    if (updateItemDto.slug) item.slug = updateItemDto.slug;
    if (updateItemDto.name_bn) item.name_bn = updateItemDto.name_bn;
    if (updateItemDto.description) item.description = updateItemDto.description;
    if (updateItemDto.type) item.type = updateItemDto.type;
    if (updateItemDto.status) item.status = updateItemDto.status;
    if (updateItemDto.regular_price) item.regular_price = updateItemDto.regular_price;
    if (updateItemDto.sale_price) item.sale_price = updateItemDto.sale_price;
    if (updateItemDto.image) item.image = updateItemDto.image;
    item.has_variations = updateItemDto.has_variations === true;

    if (updateItemDto.categories) {
      let categories: Category[] = [];

      if (Array.isArray(updateItemDto.categories)) {
        if (typeof updateItemDto.categories[0] === 'string') {
          categories = await this.categoryRepository.find({
            where: { id: In((updateItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
          });

          if (categories.length !== updateItemDto.categories.length) {
            throw new NotFoundException("One or more category IDs are invalid");
          }
        } else {
          categories = await this.categoryRepository.find({
            where: { id: In((updateItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
          });
        }
      } else if (typeof updateItemDto.categories === 'string') {
        const categoryId = updateItemDto.categories as string;
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new NotFoundException(`Category with id ${categoryId} not found`);
        }
        categories = [category];
      }

      item.categories = categories;
    }

    const updatedItem = await this.itemRepository.save(item);

    // Handle variations
    if (updateItemDto.has_variations && updateItemDto.variations && updateItemDto.variations.length > 0) {
      // Delete existing variations, then re-create
      await this.variationRepository.delete({ item_id: id });
      const variations = updateItemDto.variations.map(v => this.variationRepository.create({
        name: v.name,
        name_bn: v.name_bn,
        regular_price: v.regular_price,
        sale_price: v.sale_price ?? null,
        status: v.status,
        sort_order: v.sort_order ?? 0,
        item_id: id,
      }));
      updatedItem.variations = await this.variationRepository.save(variations);
    } else if (!updateItemDto.has_variations) {
      // If has_variations is false, remove all existing variations
      await this.variationRepository.delete({ item_id: id });
      updatedItem.variations = [];
    }

    await this.invalidateCache();
    return updatedItem;
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    const orderItemsCount = await this.itemRepository.manager.getRepository('OrderItem')
      .createQueryBuilder('orderItem')
      .where('orderItem.item_id = :itemId', { itemId: id })
      .getCount();

    if (orderItemsCount > 0) {
      throw new ConflictException(
        `Cannot delete item '${item.name}' because it is referenced in ${orderItemsCount} order item(s). ` +
        'Please remove or update the related order items first.'
      );
    }

    await this.itemRepository.softDelete(id);
    await this.invalidateCache();
  }

  async bulkSoftDelete(ids: string[]): Promise<void> {
    await this.itemRepository.softDelete(ids);
    await this.invalidateCache();
  }

  async findTrashed(options: { page: number, limit: number, search?: string }) {
    const { page, limit, search } = options;
    const query = this.itemRepository.createQueryBuilder('item')
      .withDeleted()
      .where('item.deleted_at IS NOT NULL');

    if (search) {
      query.andWhere('LOWER(item.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }

    query.orderBy('item.deleted_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async restore(id: string): Promise<void> {
    await this.itemRepository.restore(id);
    await this.invalidateCache();
  }

  async permanentDelete(id: string): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id }, withDeleted: true });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    if (!item.deleted_at) {
      throw new NotFoundException(`Item with ID ${id} is not in trash`);
    }

    const orderItemsCount = await this.itemRepository.manager.getRepository('OrderItem')
      .createQueryBuilder('orderItem')
      .where('orderItem.item_id = :itemId', { itemId: id })
      .getCount();

    if (orderItemsCount > 0) {
      throw new ConflictException(
        `Cannot permanently delete item. It has ${orderItemsCount} associated order(s).`
      );
    }

    if (item.image) {
      await this.removeItemImage(item.image);
    }

    await this.itemRepository.delete(id);
    await this.invalidateCache();
  }

  private async slugExists(slug: string): Promise<boolean> {
    const item = await this.itemRepository.findOne({ where: { slug } });
    return !!item;
  }

  private async slugExistsExcept(slug: string, id: string): Promise<boolean> {
    const item = await this.itemRepository.findOne({
      where: {
        slug,
        id: Not(id)
      }
    });
    return !!item;
  }

  async uploadItemImage(file: Express.Multer.File): Promise<string> {
    const result = await this.cloudinaryService.uploadImage(file, {
      folder: 'items',
      width: 800,
      height: 800,
      crop: 'fill',
    });
    return result.secure_url;
  }

  async removeItemImage(imageUrl: string): Promise<void> {
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      await this.cloudinaryService.deleteFile(imageUrl);
    }
  }

  async createWithImage(createItemDto: CreateItemDto, file?: Express.Multer.File): Promise<Item> {
    if (Array.isArray(createItemDto)) {
      throw new BadRequestException("createItemDto should not be an array");
    }

    const existing = await this.itemRepository.findOne({ where: { name: createItemDto.name } });
    if (existing) {
      throw new ConflictException("Item with this name already exists");
    }

    const baseSlug = generateSlug(createItemDto.name);
    let slug = baseSlug;

    let counter = 0;
    while (await this.slugExists(slug)) {
      counter++;
      slug = `${baseSlug}${counter}`;
    }

    createItemDto.slug = slug;

    if (file) {
      createItemDto.image = await this.uploadItemImage(file);
    }

    let categories: Category[] = [];

    if (createItemDto.categories && Array.isArray(createItemDto.categories)) {
      if (typeof createItemDto.categories[0] === 'string') {
        categories = await this.categoryRepository.find({
          where: { id: In((createItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
        });

        if (categories.length !== createItemDto.categories.length) {
          throw new NotFoundException("One or more category IDs are invalid");
        }
      } else {
        categories = await this.categoryRepository.find({
          where: { id: In((createItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
        });
      }
    } else if (createItemDto.categories && typeof createItemDto.categories === 'string') {
      const categoryId = createItemDto.categories as string;
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
      categories = [category];
    } else {
      throw new BadRequestException("Categories must be provided as an array of category IDs");
    }

    const item = this.itemRepository.create({
      ...createItemDto,
      categories: categories,
    });

    const savedItem = await this.itemRepository.save(item);

    // Handle variations
    if (createItemDto.has_variations && createItemDto.variations && createItemDto.variations.length > 0) {
      const variations = createItemDto.variations.map(v => this.variationRepository.create({
        name: v.name,
        name_bn: v.name_bn,
        regular_price: v.regular_price,
        sale_price: v.sale_price ?? null,
        status: v.status,
        sort_order: v.sort_order ?? 0,
        item_id: savedItem.id,
      }));
      savedItem.variations = await this.variationRepository.save(variations);
    }

    await this.invalidateCache();
    return savedItem;
  }

  async updateWithImage(id: string, updateItemDto: UpdateItemDto, file?: Express.Multer.File): Promise<Item> {
    const item = await this.findOne(id);

    if (updateItemDto.name && updateItemDto.name !== item.name) {
      const baseSlug = generateSlug(updateItemDto.name);
      let slug = baseSlug;

      let counter = 0;
      while (await this.slugExistsExcept(slug, id)) {
        counter++;
        slug = `${baseSlug}${counter}`;
      }

      updateItemDto.slug = slug;
    } else if (updateItemDto.slug && updateItemDto.slug !== item.slug) {
      if (await this.slugExistsExcept(updateItemDto.slug, id)) {
        throw new ConflictException("Item with this slug already exists");
      }
    }

    if (file) {
      if (item.image) {
        await this.removeItemImage(item.image);
      }
      updateItemDto.image = await this.uploadItemImage(file);
    }

    if (updateItemDto.name) item.name = updateItemDto.name;
    if (updateItemDto.slug) item.slug = updateItemDto.slug;
    if (updateItemDto.name_bn) item.name_bn = updateItemDto.name_bn;
    if (updateItemDto.description) item.description = updateItemDto.description;
    if (updateItemDto.type) item.type = updateItemDto.type;
    if (updateItemDto.status) item.status = updateItemDto.status;
    if (updateItemDto.regular_price) item.regular_price = updateItemDto.regular_price;
    if (updateItemDto.sale_price) item.sale_price = updateItemDto.sale_price;
    if (updateItemDto.image) item.image = updateItemDto.image;
    item.has_variations = updateItemDto.has_variations === true;

    if (updateItemDto.categories) {
      let categories: Category[] = [];

      if (Array.isArray(updateItemDto.categories)) {
        if (typeof updateItemDto.categories[0] === 'string') {
          categories = await this.categoryRepository.find({
            where: { id: In((updateItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
          });

          if (categories.length !== updateItemDto.categories.length) {
            throw new NotFoundException("One or more category IDs are invalid");
          }
        } else {
          categories = await this.categoryRepository.find({
            where: { id: In((updateItemDto.categories as (string | Category)[]).map(cat => typeof cat === 'string' ? cat : cat.id)) }
          });
        }
      } else if (typeof updateItemDto.categories === 'string') {
        const categoryId = updateItemDto.categories as string;
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new NotFoundException(`Category with id ${categoryId} not found`);
        }
        categories = [category];
      }

      item.categories = categories;
    }

    const updatedItem = await this.itemRepository.save(item);

    // Handle variations
    if (updateItemDto.has_variations && updateItemDto.variations && updateItemDto.variations.length > 0) {
      // Delete existing variations, then re-create
      await this.variationRepository.delete({ item_id: id });
      const variations = updateItemDto.variations.map(v => this.variationRepository.create({
        name: v.name,
        name_bn: v.name_bn,
        regular_price: v.regular_price,
        sale_price: v.sale_price ?? null,
        status: v.status,
        sort_order: v.sort_order ?? 0,
        item_id: id,
      }));
      updatedItem.variations = await this.variationRepository.save(variations);
    } else if (!updateItemDto.has_variations) {
      // If has_variations is false, remove all existing variations
      await this.variationRepository.delete({ item_id: id });
      updatedItem.variations = [];
    }

    await this.invalidateCache();
    return updatedItem;
  }

  private async invalidateCache(): Promise<void> {
    await this.cacheService.delete('items:*');
  }
}
