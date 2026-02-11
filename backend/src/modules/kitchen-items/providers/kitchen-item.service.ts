import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KitchenItems } from '../entities/kitchen-item.entity';
import { CreateKitchenItemDto } from '../dto/create-kitchen-item.dto';
import { UpdateKitchenItemDto } from '../dto/update-kitchen-item.dto';
import { KitchenResponseDto } from '../dto/kitchen-response-item.dto';
import { KitchenItemType } from '../enum/kitchen-item-type.enum';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class KitchenItemService {
  constructor(
    @InjectRepository(KitchenItems)
    private readonly kitchenRepository: Repository<KitchenItems>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createKitchenItemDto: CreateKitchenItemDto): Promise<KitchenResponseDto> {
    const kitchen = this.kitchenRepository.create({
      ...createKitchenItemDto,
      created_at: new Date(),
    });
    const savedKitchenItem = await this.kitchenRepository.save(kitchen);
    await this.invalidateCache();
    return new KitchenResponseDto(savedKitchenItem);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: KitchenItemType
  ): Promise<{ data: KitchenResponseDto[]; total: number }> {
    const cacheKey = `kitchen-items:findAll:${page}:${limit}:${type || 'all'}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as { data: KitchenResponseDto[]; total: number };
    }

    const skip = (page - 1) * limit;
    const whereCondition = type ? { type } : {};
    
    const [kitchens, total] = await this.kitchenRepository.findAndCount({
      where: whereCondition,
      skip,
      take: limit,
      order: { created_at: 'DESC' }
    });
    
    const data = kitchens.map(kitchen => new KitchenResponseDto(kitchen));
    const result = { data, total };
    
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findByType(type: KitchenItemType): Promise<KitchenResponseDto[]> {
    const cacheKey = `kitchen-items:findByType:${type}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as KitchenResponseDto[];
    }

    const kitchens = await this.kitchenRepository.find({ where: { type } });
    const result = kitchens.map(kitchen => new KitchenResponseDto(kitchen));
    
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async findOne(id: string): Promise<KitchenResponseDto> {
    const cacheKey = `kitchen-items:findOne:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached as KitchenResponseDto;
    }

    const kitchen = await this.kitchenRepository.findOne({ where: { id } });
    if (!kitchen) {
      throw new NotFoundException(`Kitchen item with ID ${id} not found`);
    }
    
    const result = new KitchenResponseDto(kitchen);
    await this.cacheService.set(cacheKey, result, 3600);
    return result;
  }

  async update(id: string, updateKitchenDto: UpdateKitchenItemDto): Promise<KitchenResponseDto> {
    const kitchen = await this.findOne(id);
    const updatedKitchen = await this.kitchenRepository.save({
      ...kitchen,
      ...updateKitchenDto,
      updated_at: new Date(),
    });
    await this.invalidateCache();
    return new KitchenResponseDto(updatedKitchen);
  }

  async remove(id: string): Promise<void> {
    const result = await this.kitchenRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Kitchen item with ID ${id} not found`);
    }
    await this.invalidateCache();
  }

  async createWithPicture(createKitchenDto: CreateKitchenItemDto, file: Express.Multer.File): Promise<KitchenResponseDto> {
    const uploadResult = await this.cloudinaryService.uploadImage(file, {
      folder: 'kitchenitems',
      publicId: `kitchen_new_${Date.now()}`,
      width: 400,
      height: 400,
      crop: 'fill'
    });
  
    createKitchenDto.image = uploadResult.secure_url;
    const kitchenItem = this.kitchenRepository.create(createKitchenDto);
    const savedItem = await this.kitchenRepository.save(kitchenItem);
    await this.invalidateCache();
    return new KitchenResponseDto(savedItem);
  }

  async updateWithPicture(id: string, updateKitchenDto: UpdateKitchenItemDto, file: Express.Multer.File): Promise<KitchenResponseDto> {
    const kitchen = await this.kitchenRepository.findOne({ where: { id } });
    if (!kitchen) {
      throw new NotFoundException(`Kitchen item with ID ${id} not found`);
    }

    if(file){
      if(kitchen.image){
        await this.cloudinaryService.deleteFile(kitchen.image);
      }

      const uploadResult = await this.cloudinaryService.uploadImage(file, {
        folder: 'kitchenitems',
        publicId: `kitchen_new_${Date.now()}`,
        width: 400,
        height: 400,
        crop: 'fill'
      });
      updateKitchenDto.image = uploadResult.secure_url;
    }

    const updatedKitchen = await this.kitchenRepository.save({
      ...updateKitchenDto,
      updated_at: new Date(),
    });
    await this.invalidateCache();
    return new KitchenResponseDto(updatedKitchen);
  }

  private async invalidateCache(): Promise<void> {
    await this.cacheService.delete('kitchen-items:*');
  }
}