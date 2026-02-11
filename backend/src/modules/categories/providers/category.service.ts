import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { generateSlug } from '../../../common/utils/string-utils';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly cacheService: CacheService,
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const category = this.categoryRepository.create({
            ...createCategoryDto,
            icon: createCategoryDto.icon === null ? undefined : createCategoryDto.icon,
            slug: generateSlug(createCategoryDto.name),
        });

        const savedCategory = await this.categoryRepository.save(category);
        await this.invalidateCache();
        return new CategoryResponseDto(savedCategory);
    }

    async findAll(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const cacheKey = `categories:findAll:${page}:${limit}:${search || 'all'}`;
        
        const cached = await this.cacheService.get<{ data: any[], total: number }>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const query = this.categoryRepository.createQueryBuilder('category');

        if (search) {
            query.where('LOWER(category.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.skip((page - 1) * limit).take(limit);
        const [data, total] = await query.getManyAndCount();
        const result = { data, total };
        await this.cacheService.set(cacheKey, result, 3600 * 1000);
        
        return result;
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        const cacheKey = `category:${id}`;
        let category = await this.cacheService.get<Category>(cacheKey);
        
        if (!category) {
            const foundCategory = await this.categoryRepository.findOne({ where: { id } });
            category = foundCategory as Category;
            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }
            
            await this.cacheService.set(cacheKey, category, 3600 * 1000);
        }
        
        return new CategoryResponseDto(category);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        Object.assign(category, {
            ...updateCategoryDto,
            icon: updateCategoryDto.icon === null ? undefined : updateCategoryDto.icon,
        });

        const savedCategory = await this.categoryRepository.save(category);
        await this.invalidateCache(id);
        return new CategoryResponseDto(savedCategory);
    }

    async remove(id: string): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        
        await this.invalidateCache(id);
    }

    async findBySlug(slug: string): Promise<CategoryResponseDto> {
        const cacheKey = `category:slug:${slug}`;
        let category = await this.cacheService.get<Category>(cacheKey);
        
        if (!category) {
            const foundCategory = await this.categoryRepository.findOne({ where: { slug } });
            category = foundCategory as Category;
            if (!category) {
                throw new NotFoundException(`Category with slug ${slug} not found`);
            }
            
            await this.cacheService.set(cacheKey, category, 3600 * 1000);
        }
        
        return new CategoryResponseDto(category);
    }
    
    private async invalidateCache(categoryId?: string): Promise<void> {
        if (categoryId) {
            await this.cacheService.delete(`category:${categoryId}`);
        }
        
        const cacheKeys = [
            'categories:findAll:1:10:all',
            'categories:findAll:1:20:all',
            'categories:findAll:1:50:all',
            'categories:findAll:*',
        ];
        
        for (const key of cacheKeys) {
            await this.cacheService.delete(key);
        }
    }
}