import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateBankDto } from "../dto/create-bank.dto";
import { Bank } from '../entities/bank.entity';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async create(createBankDto: CreateBankDto, userId: string): Promise<Bank> {
    const bank = this.bankRepository.create({
      ...createBankDto,
      user: { id: userId },
    });
    
    return this.bankRepository.save(bank);
  }

  async findOne(id: string): Promise<Bank> {
    const bank = await this.bankRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    
    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
    
    return bank;
  }

  async findByUserId(userId: string): Promise<Bank[]> {
    return this.bankRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(id: string, updateBankDto: Partial<CreateBankDto>): Promise<Bank> {
    await this.bankRepository.update(id, updateBankDto);
    const updatedBank = await this.bankRepository.findOne({ where: { id } });
    
    if (!updatedBank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
    
    return updatedBank;
  }

  async remove(id: string): Promise<void> {
    await this.bankRepository.softDelete(id);
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.bankRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.bankRepository.createQueryBuilder('bank')
            .withDeleted()
            .where('bank.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(bank.bank_name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('bank.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.bankRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.bankRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.bankRepository.delete(id);
    }
}
