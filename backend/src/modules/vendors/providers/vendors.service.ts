import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../entities/vendor.entity';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { VendorStatus } from '../enum/vendor-status.enum';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(dto: CreateVendorDto): Promise<Vendor> {
    const existing = await this.vendorRepository.findOne({
      where: { vendor_name: dto.vendor_name },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException('Vendor name already exists');
    }

    const vendor = this.vendorRepository.create({
      ...dto,
      email: dto.email || null,
      status: dto.status ?? VendorStatus.ACTIVE,
    });
    return this.vendorRepository.save(vendor);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    status?: VendorStatus;
    vendor_type?: string;
  }): Promise<{ data: Vendor[]; total: number }> {
    const { page, limit, search, status, vendor_type } = options;

    const query = this.vendorRepository.createQueryBuilder('vendor')
      .where('vendor.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(LOWER(vendor.vendor_name) LIKE :search OR LOWER(vendor.contact_person) LIKE :search OR LOWER(vendor.mobile) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (status) {
      query.andWhere('vendor.status = :status', { status });
    }

    if (vendor_type) {
      query.andWhere('vendor.vendor_type = :vendor_type', { vendor_type });
    }

    query.orderBy('vendor.created_at', 'DESC')
      .addOrderBy('vendor.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);

    if (dto.vendor_name !== undefined && dto.vendor_name !== vendor.vendor_name) {
      const existing = await this.vendorRepository.findOne({
        where: { vendor_name: dto.vendor_name },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException('Vendor name already exists');
      }
      vendor.vendor_name = dto.vendor_name;
    }

    if (dto.contact_person !== undefined) vendor.contact_person = dto.contact_person;
    if (dto.vendor_type !== undefined) vendor.vendor_type = dto.vendor_type;
    if (dto.address !== undefined) vendor.address = dto.address;
    if (dto.mobile !== undefined) vendor.mobile = dto.mobile;
    if (dto.email !== undefined) vendor.email = dto.email || null;
    if (dto.status !== undefined) vendor.status = dto.status;

    return this.vendorRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorRepository.softDelete(id);
  }

  async findActive(): Promise<Vendor[]> {
    return this.vendorRepository.find({
      where: { status: VendorStatus.ACTIVE },
      order: { vendor_name: 'ASC' },
    });
  }

  async bulkSoftDelete(ids: string[]): Promise<void> {
    await this.vendorRepository.softDelete(ids);
  }

  async findTrashed(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const query = this.vendorRepository.createQueryBuilder('vendor')
      .withDeleted()
      .where('vendor.deleted_at IS NOT NULL');

    if (search) {
      query.andWhere(
        '(LOWER(vendor.vendor_name) LIKE :search OR LOWER(vendor.contact_person) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('vendor.deleted_at', 'DESC')
      .addOrderBy('vendor.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async restore(id: string): Promise<void> {
    await this.vendorRepository.restore(id);
  }

  async permanentDelete(id: string): Promise<void> {
    const entity = await this.vendorRepository.findOne({ where: { id }, withDeleted: true });
    if (!entity) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    if (!entity.deleted_at) {
      throw new NotFoundException(`Record with ID ${id} is not in trash`);
    }
    await this.vendorRepository.delete(id);
  }

  async bulkRestore(ids: string[]): Promise<void> {
    await this.vendorRepository.restore(ids);
  }

  async bulkPermanentDelete(ids: string[]): Promise<{ deleted: string[]; failed: { id: string; reason: string }[] }> {
    const deleted: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const id of ids) {
      try {
        const entity = await this.vendorRepository.findOne({
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
        await this.vendorRepository.delete(id);
        deleted.push(id);
      } catch (error: any) {
        failed.push({ id, reason: error?.message || 'Unknown error' });
      }
    }

    return { deleted, failed };
  }
}
