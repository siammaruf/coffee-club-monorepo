import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Discount } from '../../discount/entities/discount.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreateDiscountApplicationDto } from '../dto/create-discount-application.dto';
import { UpdateDiscountApplicationDto } from '../dto/update-discount-application.dto';
import { DiscountApplication } from '../entities/discount-application.entities';

@Injectable()
export class DiscountApplicationService {
  constructor(
    @InjectRepository(DiscountApplication)
    private readonly discountApplicationRepository: Repository<DiscountApplication>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateDiscountApplicationDto): Promise<DiscountApplication> {
    const discount = await this.discountRepository.findOne({ where: { id: dto.discount } });
    if (!discount) throw new NotFoundException('Discount not found');

    const customers = dto.customers?.length
      ? await this.customerRepository.find({ where: { id: In(dto.customers) } })
      : [];
    const products = dto.products?.length
      ? await this.itemRepository.find({ where: { id: In(dto.products) } })
      : [];
    const categories = dto.categories?.length
      ? await this.categoryRepository.find({ where: { id: In(dto.categories) } })
      : [];

    const discountApplication = this.discountApplicationRepository.create({
      discount_type: dto.discount_type,
      discount,
      customers,
      products,
      categories,
    });

    return await this.discountApplicationRepository.save(discountApplication);
  }

  async findAll(): Promise<DiscountApplication[]> {
    return this.discountApplicationRepository.find({
      relations: ['discount', 'customers', 'products', 'categories'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DiscountApplication> {
    const discountApplication = await this.discountApplicationRepository.findOne({
      where: { id },
      relations: ['discount', 'customers', 'products', 'categories'],
    });
    if (!discountApplication) throw new NotFoundException('Discount application not found');
    return discountApplication;
  }

  async update(id: string, dto: UpdateDiscountApplicationDto): Promise<DiscountApplication> {
    const discountApplication = await this.findOne(id);

    if (dto.discount_type) discountApplication.discount_type = dto.discount_type;

    if (dto.discount) {
      const discount = await this.discountRepository.findOne({ where: { id: dto.discount } });
      if (!discount) throw new NotFoundException('Discount not found');
      discountApplication.discount = discount;
    }

    if (dto.customers) {
      discountApplication.customers = await this.customerRepository.find({ where: { id: In(dto.customers) } });
    }
    if (dto.products) {
      discountApplication.products = await this.itemRepository.find({ where: { id: In(dto.products) } });
    }
    if (dto.categories) {
      discountApplication.categories = await this.categoryRepository.find({ where: { id: In(dto.categories) } });
    }

    return await this.discountApplicationRepository.save(discountApplication);
  }

  async remove(id: string): Promise<void> {
    const discountApplication = await this.findOne(id);
    await this.discountApplicationRepository.remove(discountApplication);
  }
}
