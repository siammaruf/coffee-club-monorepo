import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppPromotion } from '../entities/whatsapp-promotion.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { CustomerType } from '../../customers/enum/customer-type.enum';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionStatus, PromotionTarget } from '../enums';

@Injectable()
export class WhatsAppPromotionService {
  private readonly logger = new Logger(WhatsAppPromotionService.name);

  constructor(
    @InjectRepository(WhatsAppPromotion)
    private readonly promotionRepo: Repository<WhatsAppPromotion>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly messageService: WhatsAppMessageService,
  ) {}

  async create(dto: CreatePromotionDto): Promise<WhatsAppPromotion> {
    const promotion = this.promotionRepo.create(dto);
    return this.promotionRepo.save(promotion);
  }

  async update(id: string, dto: UpdatePromotionDto): Promise<WhatsAppPromotion> {
    const promotion = await this.findOneOrFail(id);

    if (promotion.status === PromotionStatus.SENT) {
      throw new BadRequestException('Cannot edit a sent promotion');
    }

    Object.assign(promotion, dto);
    return this.promotionRepo.save(promotion);
  }

  async findAll(params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.promotionRepo.createQueryBuilder('p');

    if (params.status) {
      qb.andWhere('p.status = :status', { status: params.status });
    }

    qb.orderBy('p.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<WhatsAppPromotion> {
    return this.findOneOrFail(id);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOneOrFail(id);
    await this.promotionRepo.softRemove(promotion);
  }

  async getRecipientCount(target: PromotionTarget): Promise<number> {
    const qb = this.customerRepo.createQueryBuilder('c');
    qb.where('c.is_active = :active', { active: true });
    qb.andWhere('c.phone IS NOT NULL');
    qb.andWhere("c.phone != ''");

    if (target === PromotionTarget.REGULAR) {
      qb.andWhere('c.customer_type = :type', { type: CustomerType.REGULAR });
    } else if (target === PromotionTarget.MEMBER) {
      qb.andWhere('c.customer_type = :type', { type: CustomerType.MEMBER });
    }

    return qb.getCount();
  }

  async send(id: string): Promise<WhatsAppPromotion> {
    const promotion = await this.findOneOrFail(id);

    if (promotion.status === PromotionStatus.SENT) {
      throw new BadRequestException('Promotion already sent');
    }

    const recipients = await this.getTargetedCustomers(promotion.target);

    if (recipients.length === 0) {
      throw new BadRequestException('No eligible recipients found');
    }

    promotion.total_recipients = recipients.length;
    promotion.status = PromotionStatus.SENT;
    promotion.sent_at = new Date();

    const mappedRecipients = recipients.map((c) => ({
      phone: c.phone,
      name: c.name,
    }));

    const result = await this.messageService.sendBulk(
      mappedRecipients,
      promotion.message,
      'promotion',
      promotion.id,
    );

    promotion.successful_count = result.successful;
    promotion.failed_count = result.failed;

    return this.promotionRepo.save(promotion);
  }

  private async getTargetedCustomers(
    target: PromotionTarget,
  ): Promise<Customer[]> {
    const qb = this.customerRepo.createQueryBuilder('c');
    qb.where('c.is_active = :active', { active: true });
    qb.andWhere('c.phone IS NOT NULL');
    qb.andWhere("c.phone != ''");

    if (target === PromotionTarget.REGULAR) {
      qb.andWhere('c.customer_type = :type', { type: CustomerType.REGULAR });
    } else if (target === PromotionTarget.MEMBER) {
      qb.andWhere('c.customer_type = :type', { type: CustomerType.MEMBER });
    }

    return qb.getMany();
  }

  private async findOneOrFail(id: string): Promise<WhatsAppPromotion> {
    const promotion = await this.promotionRepo.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion #${id} not found`);
    }
    return promotion;
  }
}
