import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreatePartnerDto): Promise<Partner> {
    const logo = await this.cloudinaryService.ensureCloudinaryUrl(
      dto.logo,
      'coffee-club/partners',
    );

    const partner = this.partnerRepository.create({
      ...dto,
      logo: logo || dto.logo,
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
      .addOrderBy('partner.id', 'ASC')
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
    if (dto.logo !== undefined) {
      partner.logo = await this.cloudinaryService.ensureCloudinaryUrl(
        dto.logo,
        'coffee-club/partners',
      ) || dto.logo;
    }
    if (dto.website !== undefined) partner.website = dto.website || null;
    if (dto.sort_order !== undefined) partner.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) partner.is_active = dto.is_active;

    return this.partnerRepository.save(partner);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.findOne(id);
    await this.partnerRepository.softDelete(id);
  }

  // Public

  async findActive(): Promise<Partner[]> {
    return this.partnerRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.partnerRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.partnerRepository.createQueryBuilder('partner')
            .withDeleted()
            .where('partner.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(partner.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('partner.deleted_at', 'DESC')
            .addOrderBy('partner.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.partnerRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.partnerRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.partnerRepository.delete(id);
    }
}
