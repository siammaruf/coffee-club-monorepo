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
    await this.bankRepository.delete(id);
  }
}