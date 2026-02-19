import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { EncryptionUtil } from '../../../common/utils/encryption.util';
import { Order } from 'src/modules/orders/entities/order.entity';
import { CacheService } from '../../cache/cache.service';
import { SettingsService } from '../../settings/settings.service';
import { CustomerType } from '../enum/customer-type.enum';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService,
    private readonly settingsService: SettingsService,
  ) {}

  private async getPointsConfig() {
    const cacheKey = 'points:config';
    const cached = await this.cacheService.get<{
      POINTS_PER_TAKA: number;
      POINTS_FOR_BALANCE: number;
      TAKA_PER_100_POINTS: number;
      MINIMUM_REDEEM_AMOUNT: number;
    }>(cacheKey);
    if (cached) return cached;

    const [pointsPerTaka, pointsForBalance, takaPerPoints, minRedeem] = await Promise.all([
      this.settingsService.getSetting('points_per_taka'),
      this.settingsService.getSetting('points_for_balance'),
      this.settingsService.getSetting('taka_per_100_points'),
      this.settingsService.getSetting('minimum_redeem_amount'),
    ]);

    const config = {
      POINTS_PER_TAKA: parseInt(pointsPerTaka || '1', 10),
      POINTS_FOR_BALANCE: parseInt(pointsForBalance || '100', 10),
      TAKA_PER_100_POINTS: parseInt(takaPerPoints || '3', 10),
      MINIMUM_REDEEM_AMOUNT: parseInt(minRedeem || '150', 10),
    };

    await this.cacheService.set(cacheKey, config, 300 * 1000);
    return config;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = this.customerRepository.create(createCustomerDto);
    const savedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(savedCustomer);
  }

  async findAll(options?: { page?: number, limit?: number, search?: string, is_active?: boolean, customer_type?: CustomerType }): Promise<{ data: CustomerResponseDto[], total: number }> {
    const { page = 1, limit = 10, search, is_active, customer_type } = options || {};
    const cacheKey = `customers:findAll:${page}:${limit}:${search || 'all'}:${is_active !== undefined ? is_active : 'all'}:${customer_type || 'all'}`;
    const cached = await this.cacheService.get<{ data: CustomerResponseDto[], total: number }>(cacheKey);

    if (cached && cached.total > 0) {
      return cached;
    }

    const query = this.customerRepository.createQueryBuilder('customer');
    if (search) {
      query.where('LOWER(customer.name) LIKE :search OR LOWER(customer.email) LIKE :search',
        { search: `%${search.toLowerCase()}%` });
    }

    if (is_active !== undefined) {
      if (search) {
        query.andWhere('customer.is_active = :is_active', { is_active });
      } else {
        query.where('customer.is_active = :is_active', { is_active });
      }
    }

    if (customer_type) {
      if (query.expressionMap.wheres.length > 0) {
        query.andWhere('customer.customer_type = :customer_type', { customer_type });
      } else {
        query.where('customer.customer_type = :customer_type', { customer_type });
      }
    }

    query.skip((page - 1) * limit).take(limit);
    const [data, total] = await query.getManyAndCount();
    const result = {
      data: data.map(customer => new CustomerResponseDto(customer)),
      total
    };

    await this.cacheService.set(cacheKey, result, 3600 * 1000);
    return result;
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const cacheKey = `customer:${id}`;
    
    let customer: Customer | null = await this.cacheService.get<Customer>(cacheKey) ?? null;

    if (!customer) {
      customer = await this.customerRepository.findOne({
        where: { id },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      await this.cacheService.set(cacheKey, customer, 3600 * 1000);
    }

    return new CustomerResponseDto(customer);
  }

  async findByEmail(email: string): Promise<CustomerResponseDto> {
    const cacheKey = `customer:email:${email}`;

    let customer: Customer | null = await this.cacheService.get<Customer>(cacheKey) ?? null;

    if (!customer) {
      customer = await this.customerRepository.findOne({
        where: { email },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with email ${email} not found`);
      }

      await this.cacheService.set(cacheKey, customer, 3600 * 1000);
    }

    return new CustomerResponseDto(customer);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const customerToUpdate = this.customerRepository.create({
      ...customer,
      ...updateCustomerDto,
    });

    const updatedCustomer = await this.customerRepository.save(customerToUpdate);
    await this.invalidateCache();
    return new CustomerResponseDto(updatedCustomer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  
    const orderCount = await this.orderRepository.count({
      where: { customer: { id } }
    });
  
    if (orderCount > 0) {
      throw new ConflictException(
        `Cannot delete customer. Customer has ${orderCount} associated order(s). Please reassign or remove the orders first.`
      );
    }
  
    await this.customerRepository.softDelete(id);
    await this.invalidateCache();
  }

  async addPointsFromOrder(customerId: string, orderAmount: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.customer_type !== CustomerType.MEMBER) {
      return customer;
    }

    const config = await this.getPointsConfig();
    const validOrderAmount = Number(orderAmount) || 0;
    const pointsToAdd = Math.floor(validOrderAmount * config.POINTS_PER_TAKA);
    const currentPoints = Number(customer.points) || 0;
    customer.points = currentPoints + pointsToAdd;
    customer.balance = Math.floor(customer.points / config.POINTS_FOR_BALANCE) * config.TAKA_PER_100_POINTS;
    const result = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return result;
  }

  async redeemPoints(customerId: string, redeemAmount: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.customer_type !== CustomerType.MEMBER) {
      throw new BadRequestException('Only member customers can redeem points');
    }

    const config = await this.getPointsConfig();
    const validRedeemAmount = Number(redeemAmount) || 0;

    if (validRedeemAmount < config.MINIMUM_REDEEM_AMOUNT) {
      throw new BadRequestException(`Minimum redeem amount is ${config.MINIMUM_REDEEM_AMOUNT} taka`);
    }

    const requiredPoints = Math.ceil((validRedeemAmount / config.TAKA_PER_100_POINTS) * config.POINTS_FOR_BALANCE);
    const currentPoints = Number(customer.points) || 0;

    if (currentPoints < requiredPoints) {
      throw new BadRequestException(`Insufficient points. Required: ${requiredPoints} points, Available: ${currentPoints} points`);
    }

    customer.points = currentPoints - requiredPoints;
    customer.balance = Math.floor(customer.points / config.POINTS_FOR_BALANCE) * config.TAKA_PER_100_POINTS;
    const result = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return result;
  }

  async deductPoints(customerId: string, pointsToDeduct: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.customer_type !== CustomerType.MEMBER) {
      throw new BadRequestException('Only member customers can have points deducted');
    }

    const config = await this.getPointsConfig();
    const validPointsToDeduct = Number(pointsToDeduct) || 0;
    const currentPoints = Number(customer.points) || 0;

    if (currentPoints < validPointsToDeduct) {
      throw new BadRequestException('Insufficient points balance');
    }

    customer.points = currentPoints - validPointsToDeduct;
    customer.balance = Math.floor(customer.points / config.POINTS_FOR_BALANCE) * config.TAKA_PER_100_POINTS;
    const result = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return result;
  }

  async getCustomerBalance(customerId: string): Promise<{ points: number; balance: number }> {
    const cacheKey = `customer:balance:${customerId}`;

    const cached = await this.cacheService.get<{ points: number; balance: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const customer = await this.findOne(customerId);

    if (customer.customer_type !== CustomerType.MEMBER) {
      return { points: 0, balance: 0 };
    }

    const result = {
      points: Number(customer.points) || 0,
      balance: Number(customer.balance) || 0
    };

    await this.cacheService.set(cacheKey, result, 1800 * 1000);
    return result;
  }

  async canRedeem(customerId: string, amount: number): Promise<{ canRedeem: boolean; message?: string }> {
    const customer = await this.findOne(customerId);

    if (customer.customer_type !== CustomerType.MEMBER) {
      return { canRedeem: false, message: 'Only member customers can redeem points' };
    }

    const config = await this.getPointsConfig();
    const validAmount = Number(amount) || 0;

    if (validAmount < config.MINIMUM_REDEEM_AMOUNT) {
      return {
        canRedeem: false,
        message: `Minimum redeem amount is ${config.MINIMUM_REDEEM_AMOUNT} taka`
      };
    }

    const requiredPoints = Math.ceil((validAmount / config.TAKA_PER_100_POINTS) * config.POINTS_FOR_BALANCE);
    const currentPoints = Number(customer.points) || 0;

    if (currentPoints < requiredPoints) {
      return {
        canRedeem: false,
        message: `Insufficient points. Required: ${requiredPoints} points, Available: ${currentPoints} points`
      };
    }

    return { canRedeem: true };
  }

  async uploadCustomerPicture(customerId: string, file: Express.Multer.File): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.picture) {
      await this.cloudinaryService.deleteFile(customer.picture);
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file, {
      folder: 'customers',
      publicId: `customer_${customerId}_${Date.now()}`,
      width: 400,
      height: 400,
      crop: 'fill'
    });

    customer.picture = uploadResult.secure_url;
    const updatedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(updatedCustomer);
  }

  async removeCustomerPicture(customerId: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (!customer.picture) {
      throw new NotFoundException('Customer has no picture to remove');
    }

    await this.cloudinaryService.deleteFile(customer.picture);
    customer.picture = '';
    const updatedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(updatedCustomer);
  }

  async resetCustomerPassword(customerId: string, newPassword: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const { encryptedPassword, iv } = await EncryptionUtil.encryptPassword(newPassword);
    customer.password = `${encryptedPassword}:${iv}`;
    await this.customerRepository.save(customer);
  }

  async updateCustomerWithPicture(id: string, updateCustomerDto: UpdateCustomerDto, file?: Express.Multer.File): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (file) {
      if (customer.picture) {
        await this.cloudinaryService.deleteFile(customer.picture);
      }

      const uploadResult = await this.cloudinaryService.uploadImage(file, {
        folder: 'customers',
        publicId: `customer_${id}_${Date.now()}`,
        width: 400,
        height: 400,
        crop: 'fill'
      });

      updateCustomerDto.picture = uploadResult.secure_url;
    }

    const customerToUpdate = this.customerRepository.create({
      ...customer,
      ...updateCustomerDto,
    });

    const updatedCustomer = await this.customerRepository.save(customerToUpdate);
    await this.invalidateCache();
    return new CustomerResponseDto(updatedCustomer);
  }

  async createWithPicture(createCustomerDto: CreateCustomerDto, file: Express.Multer.File): Promise<CustomerResponseDto> {
    const uploadResult = await this.cloudinaryService.uploadImage(file, {
      folder: 'customers',
      publicId: `customer_new_${Date.now()}`,
      width: 400,
      height: 400,
      crop: 'fill'
    });
  
    createCustomerDto.picture = uploadResult.secure_url;
    const customer = this.customerRepository.create(createCustomerDto);
    const savedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(savedCustomer);
  }
  
  async activateCustomer(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  
    customer.is_active = true;
    const updatedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(updatedCustomer);
  }
  
  async deactivateCustomer(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  
    customer.is_active = false;
    const updatedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(updatedCustomer);
  }
  
  private async invalidateCache(): Promise<void> {
    await this.cacheService.delete('customer:*');
    await this.cacheService.delete('customers:*');
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.customerRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.customerRepository.createQueryBuilder('customer')
            .withDeleted()
            .where('customer.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(customer.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('customer.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.customerRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.customerRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.customerRepository.delete(id);
        await this.invalidateCache();
    }
}
