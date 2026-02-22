import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ExpenseCategory } from '../entities/expense-categories.entity';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from '../dto/update-expense-category.dto';
import { ExpenseCategoryResponseDto } from '../dto/expense-category-response.dto';
import { generateSlug } from '../../../common/utils/string-utils';
import { CacheService } from '../../cache/cache.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
    private readonly cacheService: CacheService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async invalidateCache(): Promise<void> {
      const patterns = [
          'expense-categories:*',
          'expense-category:*'
      ];
      
      for (const pattern of patterns) {
          const keys = await this.cacheService.getKeys(pattern);
          if (keys.length > 0) {
              await this.cacheService.deleteMany(keys);
          }
      }
  }

  async create(createDto: CreateExpenseCategoryDto): Promise<ExpenseCategoryResponseDto> {
    const existingCategory = await this.expenseCategoryRepository.findOne({
      where: { name: createDto.name }
    });

    if (existingCategory) {
      throw new ConflictException(`Expense category with name "${createDto.name}" already exists`);
    }

    if (!createDto.slug) {
      createDto.slug = generateSlug(createDto.name);
    } else {
      createDto.slug = generateSlug(createDto.slug);
    }

    const existingSlug = await this.expenseCategoryRepository.findOne({
      where: { slug: createDto.slug }
    });

    if (existingSlug) {
      let counter = 1;
      let newSlug = `${createDto.slug}${counter}`;
      
      while (await this.expenseCategoryRepository.findOne({ where: { slug: newSlug } })) {
        counter++;
        newSlug = `${createDto.slug}${counter}`;
      }
      
      createDto.slug = newSlug;
    }

    if (createDto.icon) {
      createDto.icon = await this.cloudinaryService.ensureCloudinaryUrl(
        createDto.icon,
        'coffee-club/expense-categories',
      ) ?? undefined;
    }

    const category = this.expenseCategoryRepository.create({
      ...createDto
    });

    const savedCategory = await this.expenseCategoryRepository.save(category);
    
    await this.invalidateCache();
    
    return new ExpenseCategoryResponseDto(savedCategory);
  }

  async findAll(options?: { 
    search?: string,
    page?: number,
    limit?: number
  }): Promise<{ 
    data: ExpenseCategoryResponseDto[], 
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const search = options?.search || '';
    
    const cacheKey = `expense-categories:page:${page}:limit:${limit}:search:${search}`;
    
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return cachedResult as { 
        data: ExpenseCategoryResponseDto[], 
        total: number,
        page: number, 
        limit: number,
        totalPages: number
      };
    }
    
    const queryBuilder = this.expenseCategoryRepository.createQueryBuilder('expenseCategory');
    
    if (options?.search) {
      queryBuilder.andWhere(
        '(LOWER(expenseCategory.name) LIKE :search OR LOWER(expenseCategory.description) LIKE :search)',
        { search: `%${options.search.toLowerCase()}%` }
      );
    }
    
    queryBuilder
      .orderBy('expenseCategory.created_at', 'DESC')
      .addOrderBy('expenseCategory.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [categories, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    
    const result = {
      data: categories.map(category => new ExpenseCategoryResponseDto(category)),
      total,
      page,
      limit,
      totalPages
    };
    
    await this.cacheService.set(cacheKey, result, 3600);
    
    return result;
  }

  async findOne(id: string): Promise<ExpenseCategoryResponseDto> {
    const cacheKey = `expense-category:${id}`;
    
    const cachedCategory = await this.cacheService.get(cacheKey);
    if (cachedCategory) {
      return new ExpenseCategoryResponseDto(cachedCategory);
    }

    const category = await this.expenseCategoryRepository.findOne({
      where: { id }
    });
    
    if (!category) {
      throw new NotFoundException(`Expense category with ID "${id}" not found`);
    }
    
    const result = new ExpenseCategoryResponseDto(category);
    await this.cacheService.set(cacheKey, result, 3600);
    
    return result;
  }

  async findBySlug(slug: string): Promise<ExpenseCategoryResponseDto> {
    const cacheKey = `expense-category:slug:${slug}`;
    
    const cachedCategory = await this.cacheService.get(cacheKey);
    if (cachedCategory) {
      return new ExpenseCategoryResponseDto(cachedCategory);
    }

    const category = await this.expenseCategoryRepository.findOne({
      where: { slug }
    });
    
    if (!category) {
      throw new NotFoundException(`Expense category with slug "${slug}" not found`);
    }
    
    const result = new ExpenseCategoryResponseDto(category);
    await this.cacheService.set(cacheKey, result, 3600);
    
    return result;
  }

  async update(id: string, updateDto: UpdateExpenseCategoryDto): Promise<ExpenseCategoryResponseDto> {
    const category = await this.expenseCategoryRepository.findOne({
      where: { id }
    });
    
    if (!category) {
      throw new NotFoundException(`Expense category with ID "${id}" not found`);
    }

    if (updateDto.name && updateDto.name !== category.name) {
      const existingCategory = await this.expenseCategoryRepository.findOne({
        where: { name: updateDto.name }
      });
      
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(`Expense category with name "${updateDto.name}" already exists`);
      }
    }

    if (updateDto.name && !updateDto.slug) {
      updateDto.slug = generateSlug(updateDto.name);
    } else if (updateDto.slug) {
      updateDto.slug = generateSlug(updateDto.slug);
    }

    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existingSlug = await this.expenseCategoryRepository.findOne({
        where: { 
          slug: updateDto.slug,
          id: Not(id) 
        }
      });
      
      if (existingSlug) {
        let counter = 1;
        let newSlug = `${updateDto.slug}${counter}`;
        
        while (await this.expenseCategoryRepository.findOne({ 
          where: { 
            slug: newSlug,
            id: Not(id)
          } 
        })) {
          counter++;
          newSlug = `${updateDto.slug}${counter}`;
        }
        
        updateDto.slug = newSlug;
      }
    }

    if (updateDto.icon) {
      updateDto.icon = await this.cloudinaryService.ensureCloudinaryUrl(
        updateDto.icon,
        'coffee-club/expense-categories',
      ) ?? undefined;
    }

    Object.assign(category, updateDto);
    const updatedCategory = await this.expenseCategoryRepository.save(category);
    
    await this.invalidateCache();
    
    return new ExpenseCategoryResponseDto(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findOne({
      where: { id }
    });
    
    if (!category) {
      throw new NotFoundException(`Expense category with ID "${id}" not found`);
    }
    
    await this.expenseCategoryRepository.softDelete(id);

    await this.invalidateCache();
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.expenseCategoryRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.expenseCategoryRepository.createQueryBuilder('expenseCategory')
            .withDeleted()
            .where('expenseCategory.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(expenseCategory.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('expenseCategory.deleted_at', 'DESC')
            .addOrderBy('expenseCategory.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.expenseCategoryRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.expenseCategoryRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.expenseCategoryRepository.delete(id);
        await this.invalidateCache();
    }
}
