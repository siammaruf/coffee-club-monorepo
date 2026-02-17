import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from '../entities/discount.entity';
import { BaseDiscountDto } from '../dto/base-discount.dto';
import { DiscountResponseDto } from '../dto/discount-response.dto';
import { DiscountType } from '../enum/discount-type.enum';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class DiscountService {
    constructor(
        @InjectRepository(Discount)
        private readonly discountRepository: Repository<Discount>,
        private readonly cacheService: CacheService,
    ) {}

    private validatePercentage(percentage: number) {
        if (percentage < 0 || percentage > 100) {
            throw new BadRequestException('Discount percentage must be between 0 and 100');
        }
    }

    private validateDiscountType(type: DiscountType) {
        if (!Object.values(DiscountType).includes(type)) {
            throw new BadRequestException('Invalid discount type');
        }
    }

    private async invalidateCache() {
        await this.cacheService.delete('discounts:*');
        await this.cacheService.delete('discount:*');
    }

    async create(createDiscountDto: BaseDiscountDto): Promise<DiscountResponseDto> {
        if (createDiscountDto.discount_value < 0) {
            throw new BadRequestException('Discount value cannot be negative');
        }
        this.validatePercentage(createDiscountDto.discount_value);
        this.validateDiscountType(createDiscountDto.discount_type);
        const discount = this.discountRepository.create(createDiscountDto);
        const savedDiscount = await this.discountRepository.save(discount);
        
        await this.invalidateCache();
        
        return new DiscountResponseDto(savedDiscount);
    }

    async findAll(page: number, limit: number, search?: string): Promise<{
        discounts: DiscountResponseDto[];
        total: number;
    }> {
        const cacheKey = `discounts:page:${page}:limit:${limit}:search:${search || 'none'}`;
        
        const cachedResult = await this.cacheService.get(cacheKey);
        if (cachedResult) {
            return {
                discounts: (cachedResult as any).discounts.map(d => new DiscountResponseDto(d)),
                total: (cachedResult as any).total
            };
        }

        const query = this.discountRepository.createQueryBuilder('discount');

        if (search) {
            query.where('LOWER(discount.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.skip((page - 1) * limit).take(limit);
        const [discounts, total] = await query.getManyAndCount();
        const result = { discounts, total };
        
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async findOne(id: string): Promise<DiscountResponseDto> {
        const cacheKey = `discount:${id}`;
        
        const cachedDiscount = await this.cacheService.get(cacheKey);
        if (cachedDiscount) {
            return new DiscountResponseDto(cachedDiscount);
        }

        const discount = await this.discountRepository.findOne({ where: { id } });
        if (!discount) {
            throw new NotFoundException(`Discount with ID ${id} not found`);
        }
        
        const result = new DiscountResponseDto(discount);
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async update(id: string, updateDiscountDto: BaseDiscountDto): Promise<DiscountResponseDto> {
        if (updateDiscountDto.discount_value !== undefined) {
            this.validatePercentage(updateDiscountDto.discount_value);
        }

        if (updateDiscountDto.discount_type !== undefined) {
            this.validateDiscountType(updateDiscountDto.discount_type);
        }

        const discount = await this.findOne(id);
        const updatedDiscount = Object.assign(discount, updateDiscountDto);
        const savedDiscount = await this.discountRepository.save(updatedDiscount);
        
        await this.invalidateCache();
        
        return new DiscountResponseDto(savedDiscount);
    }

    async remove(id: string): Promise<void> {
        const result = await this.discountRepository.softDelete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Discount with ID ${id} not found`);
        }
        
        await this.invalidateCache();
    }

    async findByName(name: string): Promise<DiscountResponseDto> {
        const cacheKey = `discount:name:${name}`;
        
        const cachedDiscount = await this.cacheService.get(cacheKey);
        if (cachedDiscount) {
            return new DiscountResponseDto(cachedDiscount);
        }

        const discount = await this.discountRepository.findOne({ where: { name } });
        if (!discount) {
            throw new NotFoundException(`Discount with name ${name} not found`);
        }
        
        const result = new DiscountResponseDto(discount);
        await this.cacheService.set(cacheKey, result, 3600);
        
        return result;
    }

    async findAllNotExpired(): Promise<DiscountResponseDto[]> {
        const cacheKey = 'discounts:not-expired';
        
        const cachedDiscounts = await this.cacheService.get(cacheKey);
        if (cachedDiscounts) {
            return (cachedDiscounts as DiscountResponseDto[]).map(d => new DiscountResponseDto(d));
        }

        const now = new Date();
        const discounts = await this.discountRepository.createQueryBuilder('discount')
            .where('discount.expiry_date IS NULL OR discount.expiry_date > :now', { now })
            .getMany();
        
        const result = discounts.map(d => new DiscountResponseDto(d));
        await this.cacheService.set(cacheKey, result, 1800);
        
        return result;
    }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.discountRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.discountRepository.createQueryBuilder('discount')
            .withDeleted()
            .where('discount.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(discount.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('discount.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.discountRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.discountRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.discountRepository.delete(id);
        await this.invalidateCache();
    }
}
