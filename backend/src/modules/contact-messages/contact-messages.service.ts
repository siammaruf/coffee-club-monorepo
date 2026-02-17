import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const message = this.contactMessageRepository.create({
      ...dto,
      phone: dto.phone || null,
      subject: dto.subject || null,
    });
    return this.contactMessageRepository.save(message);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }): Promise<{ data: ContactMessage[]; total: number }> {
    const { page, limit, search, status } = options;

    const query = this.contactMessageRepository.createQueryBuilder('msg');

    if (status) {
      query.andWhere('msg.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(msg.name) LIKE :search OR LOWER(msg.email) LIKE :search OR LOWER(msg.subject) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('msg.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.contactMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }
    return message;
  }

  async reply(id: string, adminReply: string): Promise<ContactMessage> {
    const message = await this.findOne(id);
    message.admin_reply = adminReply;
    message.status = 'replied';
    message.replied_at = new Date();
    return this.contactMessageRepository.save(message);
  }

  async updateStatus(id: string, status: string): Promise<ContactMessage> {
    const message = await this.findOne(id);
    message.status = status;
    return this.contactMessageRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.contactMessageRepository.softDelete(id);
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.contactMessageRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.contactMessageRepository.createQueryBuilder('contactMessage')
            .withDeleted()
            .where('contactMessage.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(contactMessage.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('contactMessage.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.contactMessageRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.contactMessageRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.contactMessageRepository.delete(id);
    }
}
