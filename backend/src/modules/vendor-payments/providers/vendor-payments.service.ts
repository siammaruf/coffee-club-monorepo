import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorPayment } from '../entities/vendor-payment.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { CreateVendorPaymentDto } from '../dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from '../dto/update-vendor-payment.dto';
import { VendorPaymentResponseDto } from '../dto/vendor-payment-response.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class VendorPaymentsService {
  constructor(
    @InjectRepository(VendorPayment)
    private readonly paymentRepo: Repository<VendorPayment>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateVendorPaymentDto, file?: Express.Multer.File, userId?: string): Promise<VendorPaymentResponseDto> {
    const vendor = await this.vendorRepo.findOne({ where: { id: dto.vendor_id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    let screenshotUrl: string | null = dto.screenshot_url || null;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, {
        folder: 'coffee-club/vendor-payments',
      });
      screenshotUrl = uploadResult.secure_url || null;
    } else if (dto.screenshot_url) {
      screenshotUrl = await this.cloudinaryService.ensureCloudinaryUrl(dto.screenshot_url, 'coffee-club/vendor-payments');
    }

    const payment = this.paymentRepo.create({
      ...dto,
      screenshot_url: screenshotUrl,
      created_by_id: userId ?? null,
    });
    const saved = await this.paymentRepo.save(payment);
    return this.toResponse(saved);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    vendor_id?: string;
    start_date?: string;
    end_date?: string;
    payment_type?: string;
  }): Promise<{ data: VendorPaymentResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 20, vendor_id, start_date, end_date, payment_type } = params;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepo
      .createQueryBuilder('vp')
      .leftJoinAndSelect('vp.vendor', 'v')
      .where('vp.deleted_at IS NULL')
      .orderBy('vp.payment_date', 'DESC')
      .addOrderBy('vp.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (vendor_id) {
      qb.andWhere('vp.vendor_id = :vendor_id', { vendor_id });
    }
    if (start_date) {
      qb.andWhere('vp.payment_date >= :start_date', { start_date });
    }
    if (end_date) {
      qb.andWhere('vp.payment_date <= :end_date', { end_date });
    }
    if (payment_type) {
      qb.andWhere('vp.payment_type = :payment_type', { payment_type });
    }

    const [entries, total] = await qb.getManyAndCount();
    const data = entries.map(e => this.toResponse(e));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<VendorPaymentResponseDto> {
    const entry = await this.paymentRepo.findOne({
      where: { id },
      relations: ['vendor'],
    });
    if (!entry) throw new NotFoundException('Payment entry not found');
    return this.toResponse(entry);
  }

  async update(id: string, dto: UpdateVendorPaymentDto, file?: Express.Multer.File): Promise<VendorPaymentResponseDto> {
    const entry = await this.paymentRepo.findOne({ where: { id }, relations: ['vendor'] });
    if (!entry) throw new NotFoundException('Payment entry not found');

    if (dto.vendor_id) {
      const vendor = await this.vendorRepo.findOne({ where: { id: dto.vendor_id } });
      if (!vendor) throw new NotFoundException('Vendor not found');
    }

    let screenshotUrl: string | null = entry.screenshot_url;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file, {
        folder: 'coffee-club/vendor-payments',
      });
      screenshotUrl = uploadResult.secure_url || null;
    } else if (dto.screenshot_url !== undefined) {
      screenshotUrl = dto.screenshot_url
        ? await this.cloudinaryService.ensureCloudinaryUrl(dto.screenshot_url, 'coffee-club/vendor-payments')
        : null;
    }

    Object.assign(entry, dto, { screenshot_url: screenshotUrl });
    const saved = await this.paymentRepo.save(entry);
    const updated = await this.paymentRepo.findOne({ where: { id: saved.id }, relations: ['vendor'] });
    return this.toResponse(updated!);
  }

  async softDelete(id: string): Promise<void> {
    const entry = await this.paymentRepo.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Payment entry not found');
    await this.paymentRepo.softDelete(id);
  }

  async bulkSoftDelete(ids: string[]): Promise<void> {
    await this.paymentRepo.softDelete(ids);
  }

  async findTrashed(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const query = this.paymentRepo.createQueryBuilder('vp')
      .leftJoinAndSelect('vp.vendor', 'v')
      .withDeleted()
      .where('vp.deleted_at IS NOT NULL');

    if (search) {
      query.andWhere(
        '(LOWER(v.vendor_name) LIKE :search OR LOWER(vp.note) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('vp.deleted_at', 'DESC')
      .addOrderBy('vp.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data: data.map(e => this.toResponse(e)), total };
  }

  async restore(id: string): Promise<void> {
    await this.paymentRepo.restore(id);
  }

  async permanentDelete(id: string): Promise<void> {
    const entity = await this.paymentRepo.findOne({ where: { id }, withDeleted: true });
    if (!entity) throw new NotFoundException(`Record with ID ${id} not found`);
    if (!entity.deleted_at) throw new NotFoundException(`Record with ID ${id} is not in trash`);
    await this.paymentRepo.delete(id);
  }

  async bulkRestore(ids: string[]): Promise<void> {
    await this.paymentRepo.restore(ids);
  }

  async bulkPermanentDelete(ids: string[]): Promise<{ deleted: string[]; failed: { id: string; reason: string }[] }> {
    const deleted: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const id of ids) {
      try {
        const entity = await this.paymentRepo.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
          failed.push({ id, reason: 'Record not found' });
          continue;
        }
        if (!entity.deleted_at) {
          failed.push({ id, reason: 'Record is not in trash' });
          continue;
        }
        await this.paymentRepo.delete(id);
        deleted.push(id);
      } catch (error: any) {
        failed.push({ id, reason: error?.message || 'Unknown error' });
      }
    }

    return { deleted, failed };
  }

  private toResponse(entry: VendorPayment): VendorPaymentResponseDto {
    return {
      id: entry.id,
      vendor_id: entry.vendor_id,
      vendor: entry.vendor
        ? { id: entry.vendor.id, vendor_name: entry.vendor.vendor_name }
        : { id: entry.vendor_id, vendor_name: '' },
      amount: parseFloat(entry.amount as unknown as string),
      payment_date: entry.payment_date,
      payment_type: entry.payment_type,
      note: entry.note,
      screenshot_url: entry.screenshot_url,
      created_by_id: entry.created_by_id,
      deleted_at: entry.deleted_at,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
    };
  }
}
