import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { generateSlug } from '../../../common/utils/string-utils';
import { CacheService } from '../../cache/cache.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly cacheService: CacheService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        const icon = await this.cloudinaryService.ensureCloudinaryUrl(
            createCategoryDto.icon || null,
            'coffee-club/categories',
        );

        const category = this.categoryRepository.create({
            ...createCategoryDto,
            icon: icon ?? undefined,
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

        query.orderBy('category.name', 'ASC');
        query.addOrderBy('category.id', 'ASC');
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
        const icon = updateCategoryDto.icon !== undefined
            ? await this.cloudinaryService.ensureCloudinaryUrl(
                updateCategoryDto.icon || null,
                'coffee-club/categories',
              )
            : undefined;

        Object.assign(category, {
            ...updateCategoryDto,
            icon: icon === null ? undefined : (icon ?? category.icon),
        });

        const savedCategory = await this.categoryRepository.save(category);
        await this.invalidateCache();
        return new CategoryResponseDto(savedCategory);
    }

    async remove(id: string): Promise<void> {
        const result = await this.categoryRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        await this.invalidateCache();
    }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.categoryRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.categoryRepository.createQueryBuilder('category')
            .withDeleted()
            .where('category.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(category.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('category.deleted_at', 'DESC')
            .addOrderBy('category.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.categoryRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.categoryRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Category with ID ${id} is not in trash`);
        }
        await this.categoryRepository.delete(id);
        await this.invalidateCache();
    }

    async bulkRestore(ids: string[]): Promise<void> {
        await this.categoryRepository.restore(ids);
        await this.invalidateCache();
    }

    async bulkPermanentDelete(ids: string[]): Promise<{ deleted: string[]; failed: { id: string; reason: string }[] }> {
        const deleted: string[] = [];
        const failed: { id: string; reason: string }[] = [];

        for (const id of ids) {
            try {
                const entity = await this.categoryRepository.findOne({
                    where: { id },
                    withDeleted: true,
                });
                if (!entity) {
                    failed.push({ id, reason: 'Record not found' });
                    continue;
                }
                if (!entity.deleted_at) {
                    failed.push({ id, reason: 'Record is not in trash' });
                    continue;
                }
                await this.categoryRepository.delete(id);
                deleted.push(id);
            } catch (error) {
                failed.push({ id, reason: error?.message || 'Unknown error' });
            }
        }

        await this.invalidateCache();
        return { deleted, failed };
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

    private async invalidateCache(): Promise<void> {
        await this.cacheService.delete('categories:*');
        await this.cacheService.delete('category:*');
    }
}
