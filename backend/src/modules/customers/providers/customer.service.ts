import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Order } from 'src/modules/orders/entities/order.entity';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class CustomerService {
  private readonly MINIMUM_REDEEM_AMOUNT = 150; 
  private readonly POINTS_PER_TAKA = 1;
  private readonly TAKA_PER_100_POINTS = 3;
  private readonly POINTS_FOR_BALANCE = 100;

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const customer = this.customerRepository.create(createCustomerDto);
    const savedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache();
    return new CustomerResponseDto(savedCustomer);
  }

  async findAll(options?: { page?: number, limit?: number, search?: string, is_active?: boolean }): Promise<{ data: CustomerResponseDto[], total: number }> {
    const { page = 1, limit = 10, search, is_active } = options || {};
    const cacheKey = `customers:findAll:${page}:${limit}:${search || 'all'}:${is_active !== undefined ? is_active : 'all'}`;
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
    
    let customer = await this.cacheService.get<Customer>(cacheKey);
    
    if (!customer) {
      customer = await this.customerRepository.findOneOrFail({
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
    
    let customer = await this.cacheService.get<Customer>(cacheKey);
    
    if (!customer) {
      customer = await this.customerRepository.findOneOrFail({
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
    await this.invalidateCache(id);
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
  
    await this.customerRepository.delete(id);
    await this.invalidateCache(id);
  }

  async addPointsFromOrder(customerId: string, orderAmount: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }
    
    const validOrderAmount = Number(orderAmount) || 0;
    const pointsToAdd = Math.floor(validOrderAmount * this.POINTS_PER_TAKA);
    const currentPoints = Number(customer.points) || 0;
    customer.points = currentPoints + pointsToAdd;
    customer.balance = Math.floor(customer.points / this.POINTS_FOR_BALANCE) * this.TAKA_PER_100_POINTS;
    const result = await this.customerRepository.save(customer);
    await this.invalidateCache(customerId);
    return result;
  }

  async redeemPoints(customerId: string, redeemAmount: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const validRedeemAmount = Number(redeemAmount) || 0;
    
    if (validRedeemAmount < this.MINIMUM_REDEEM_AMOUNT) {
      throw new Error(`Minimum redeem amount is ${this.MINIMUM_REDEEM_AMOUNT} taka`);
    }

    const requiredPoints = Math.ceil((validRedeemAmount / this.TAKA_PER_100_POINTS) * this.POINTS_FOR_BALANCE);
    const currentPoints = Number(customer.points) || 0;
    
    if (currentPoints < requiredPoints) {
      throw new Error(`Insufficient points. Required: ${requiredPoints} points, Available: ${currentPoints} points`);
    }
    
    customer.points = currentPoints - requiredPoints;
    customer.balance = Math.floor(customer.points / this.POINTS_FOR_BALANCE) * this.TAKA_PER_100_POINTS;
    const result = await this.customerRepository.save(customer);
    await this.invalidateCache(customerId);
    return result;
  }

  async deductPoints(customerId: string, pointsToDeduct: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }
    
    const validPointsToDeduct = Number(pointsToDeduct) || 0;
    const currentPoints = Number(customer.points) || 0;
    
    if (currentPoints < validPointsToDeduct) {
      throw new Error('Insufficient points balance');
    }
    
    customer.points = currentPoints - validPointsToDeduct;
    customer.balance = Math.floor(customer.points / this.POINTS_FOR_BALANCE) * this.TAKA_PER_100_POINTS;
    const result = await this.customerRepository.save(customer);
    await this.invalidateCache(customerId);
    return result;
  }

  async getCustomerBalance(customerId: string): Promise<{ points: number; balance: number }> {
    const cacheKey = `customer:balance:${customerId}`;
    
    const cached = await this.cacheService.get<{ points: number; balance: number }>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const customer = await this.findOne(customerId);
    const result = {
      points: Number(customer.points) || 0,
      balance: Number(customer.balance) || 0
    };
    
    await this.cacheService.set(cacheKey, result, 1800 * 1000);
    return result;
  }

  async canRedeem(customerId: string, amount: number): Promise<{ canRedeem: boolean; message?: string }> {
    const validAmount = Number(amount) || 0;
    
    if (validAmount < this.MINIMUM_REDEEM_AMOUNT) {
      return {
        canRedeem: false,
        message: `Minimum redeem amount is ${this.MINIMUM_REDEEM_AMOUNT} taka`
      };
    }

    const customer = await this.findOne(customerId);
    const requiredPoints = Math.ceil((validAmount / this.TAKA_PER_100_POINTS) * this.POINTS_FOR_BALANCE);
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
    await this.invalidateCache(customerId);
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
    await this.invalidateCache(customerId);
    return new CustomerResponseDto(updatedCustomer);
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
    await this.invalidateCache(id);
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
    await this.invalidateCache(id);
    return new CustomerResponseDto(updatedCustomer);
  }
  
  async deactivateCustomer(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  
    customer.is_active = false;
    const updatedCustomer = await this.customerRepository.save(customer);
    await this.invalidateCache(id);
    return new CustomerResponseDto(updatedCustomer);
  }
  
  private async invalidateCache(customerId?: string): Promise<void> {
    if (customerId) {
      await this.cacheService.delete(`customer:${customerId}`);
      await this.cacheService.delete(`customer:balance:${customerId}`);
    }
    
    const cacheKeys = [
      'customers:findAll:1:10:all:all',
      'customers:findAll:1:20:all:all',
      'customers:findAll:1:50:all:all',
      'customers:findAll:1:10:all:true',
      'customers:findAll:1:10:all:false',
      'customers:findAllActive:*',
    ];
    
    for (const key of cacheKeys) {
      await this.cacheService.delete(key);
    }
  }
}
