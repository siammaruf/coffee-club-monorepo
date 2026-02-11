import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Table } from '../entities/table.entity';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';
import { TableResponseDto } from '../dto/table-response.dto';
import { TableStatus } from '../enum/table-status.enum';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly cacheService: CacheService,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<TableResponseDto> {
    const table = this.tableRepository.create(createTableDto);
    const savedTable = await this.tableRepository.save(table);
    await this.invalidateTableCaches();
    return new TableResponseDto(savedTable);
  }

  async findAll(options?: {
    status?: TableStatus;
    search?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: TableResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const status = options?.status || 'all';
    const search = options?.search || 'all';
    const location = options?.location || 'all';
    
    const cacheKey = `tables:findAll:${page}:${limit}:${status}:${search}:${location}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as {
        data: TableResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }
    
    const queryBuilder = this.tableRepository.createQueryBuilder('table');

    if (options?.status) {
      queryBuilder.andWhere('table.status = :status', { status: options.status });
    }
    
    if (options?.location) {
      queryBuilder.andWhere('table.location = :location', { location: options.location });
    }
    
    if (options?.search) {
      queryBuilder.andWhere(
        '(LOWER(table.number) LIKE :search OR LOWER(table.description) LIKE :search)',
        { search: `%${options.search.toLowerCase()}%` }
      );
    }

    queryBuilder
      .orderBy('table.number', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [tables, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    
    const result = {
      data: tables.map(table => new TableResponseDto(table)),
      total,
      page,
      limit,
      totalPages
    };
    
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: string): Promise<TableResponseDto> {
    const cacheKey = `table:findOne:${id}`;
    const cached = await this.cacheService.get<TableResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    
    const result = new TableResponseDto(table);
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }
  
  async findByNumber(number: string): Promise<TableResponseDto> {
    const cacheKey = `table:findByNumber:${number}`;
    const cached = await this.cacheService.get<TableResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const table = await this.tableRepository.findOne({ where: { number } });
    if (!table) {
      throw new NotFoundException(`Table with number ${number} not found`);
    }
    
    const result = new TableResponseDto(table);
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<TableResponseDto> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    if (updateTableDto.number && updateTableDto.number !== table.number) {
      const existingTable = await this.tableRepository.findOne({ 
        where: { number: updateTableDto.number } 
      });
      if (existingTable) {
        throw new BadRequestException(`Table with number ${updateTableDto.number} already exists`);
      }
    }
    
    const updatedTable = await this.tableRepository.save({
      ...table,
      ...updateTableDto,
    });
    
    await this.invalidateTableCaches();
    return new TableResponseDto(updatedTable);
  }
  
  async updateStatus(id: string, status: TableStatus): Promise<TableResponseDto> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    
    table.status = status;
    const updatedTable = await this.tableRepository.save(table);
    
    await this.invalidateTableCaches();
    return new TableResponseDto(updatedTable);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tableRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    await this.invalidateTableCaches();
  }
  
  async getAvailableTables(): Promise<TableResponseDto[]> {
    const cacheKey = 'tables:available';
    const cached = await this.cacheService.get<TableResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const tables = await this.tableRepository.find({ 
      where: { status: TableStatus.AVAILABLE },
      order: { number: 'ASC' }
    });
    
    const result = tables.map(table => new TableResponseDto(table));
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }
  
  async getTablesByLocation(location: string): Promise<TableResponseDto[]> {
    const cacheKey = `tables:location:${location}`;
    const cached = await this.cacheService.get<TableResponseDto[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const tables = await this.tableRepository.find({ 
      where: { location },
      order: { number: 'ASC' }
    });
    
    if (tables.length === 0) {
      throw new NotFoundException(`No tables found in location: ${location}`);
    }
    
    const result = tables.map(table => new TableResponseDto(table));
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }
  
  private async invalidateTableCaches(): Promise<void> {
    const patterns = [
      'tables:*',
      'table:*'
    ];
    
    for (const pattern of patterns) {
      const keys = await this.cacheService.getKeys(pattern);
      if (keys.length > 0) {
        await this.cacheService.deleteMany(keys);
      }
    }
  }
}