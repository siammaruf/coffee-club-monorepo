import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
  ) {}

  async create(dto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnerRepository.create({
      ...dto,
      website: dto.website || null,
    });
    return this.partnerRepository.save(partner);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: Partner[]; total: number }> {
    const { page, limit, search } = options;

    const query = this.partnerRepository.createQueryBuilder('partner');

    if (search) {
      query.andWhere(
        'LOWER(partner.name) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('partner.sort_order', 'ASC')
      .addOrderBy('partner.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }
    return partner;
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.findOne(id);

    if (dto.name !== undefined) partner.name = dto.name;
    if (dto.logo !== undefined) partner.logo = dto.logo;
    if (dto.website !== undefined) partner.website = dto.website || null;
    if (dto.sort_order !== undefined) partner.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) partner.is_active = dto.is_active;

    return this.partnerRepository.save(partner);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.remove(partner);
  }

  // Public

  async findActive(): Promise<Partner[]> {
    return this.partnerRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }
}
