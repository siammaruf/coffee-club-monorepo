import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Leave } from '../entities/leave.entity';
import { CreateLeaveDto } from '../dto/create-leave.dto';
import { UpdateLeaveDto } from '../dto/update-leave.dto';
import { LeaveStatus } from '../enum/leave-status.enum';
import { User } from '../../users/entities/user.entity';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class LeaveService {
    constructor(
        @InjectRepository(Leave)
        private readonly leaveRepository: Repository<Leave>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly cacheService: CacheService,
    ) {}

    async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
        await this.validateLeaveRequest(createLeaveDto);
        
        const user = await this.userRepository.findOne({
            where: { id: createLeaveDto.user_id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${createLeaveDto.user_id} not found`);
        }

        const leave = this.leaveRepository.create({
            ...createLeaveDto,
            user,
            status: LeaveStatus.PENDING,
        });

        const savedLeave = await this.leaveRepository.save(leave);
        await this.invalidateLeaveCaches();
        return savedLeave;
    }

    async findAll(): Promise<Leave[]> {
        const cacheKey = 'leave:findAll';
        const cached = await this.cacheService.get<Leave[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const leaves = await this.leaveRepository.find({
            relations: ['user'],
        });

        await this.cacheService.set(cacheKey, leaves, 3600);
        return leaves;
    }

    async findOne(id: string): Promise<Leave> {
        const cacheKey = `leave:findOne:${id}`;
        const cached = await this.cacheService.get<Leave>(cacheKey);
        if (cached) {
            return cached;
        }

        const leave = await this.leaveRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!leave) {
            throw new NotFoundException(`Leave with ID ${id} not found`);
        }

        await this.cacheService.set(cacheKey, leave, 3600);
        return leave;
    }

    async findByUser(userId: string): Promise<Leave[]> {
        const cacheKey = `leave:findByUser:${userId}`;
        const cached = await this.cacheService.get<Leave[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const leaves = await this.leaveRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        await this.cacheService.set(cacheKey, leaves, 3600);
        return leaves;
    }

    async update(id: string, updateLeaveDto: UpdateLeaveDto): Promise<Leave> {
        const leave = await this.findOne(id);

        if (updateLeaveDto.user_id) {
            const user = await this.userRepository.findOne({
                where: { id: updateLeaveDto.user_id },
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${updateLeaveDto.user_id} not found`);
            }

            leave.user = user;
        }

        Object.assign(leave, updateLeaveDto);
        const updatedLeave = await this.leaveRepository.save(leave);
        await this.invalidateLeaveCaches();
        return updatedLeave;
    }

    async updateStatus(id: string, status: LeaveStatus): Promise<Leave> {
        const leave = await this.findOne(id);
        leave.status = status;
        const updatedLeave = await this.leaveRepository.save(leave);
        await this.invalidateLeaveCaches();
        return updatedLeave;
    }

    async remove(id: string): Promise<void> {
        const leave = await this.findOne(id);
        await this.leaveRepository.softDelete(id);
        await this.invalidateLeaveCaches();
    }

    async validateLeaveRequest(createLeaveDto: CreateLeaveDto): Promise<void> {
        const { leave_start_date, leave_end_date } = createLeaveDto;
        const startDate = new Date(leave_start_date);
        const endDate = new Date(leave_end_date);
        
        if (startDate > endDate) {
            throw new BadRequestException('Leave start date must be before end date');
        }

        const existingLeave = await this.leaveRepository.findOne({
            where: {
                user: { id: createLeaveDto.user_id },
                leave_start_date: Between(startDate, endDate),
            },
        });

        if (existingLeave) {
            throw new BadRequestException('Leave request overlaps with existing leave');
        }
    }

    private async invalidateLeaveCaches(): Promise<void> {
        const patterns = [
            'leave:*'
        ];

        for (const pattern of patterns) {
            const keys = await this.cacheService.getKeys(pattern);
            if (keys.length > 0) {
                await this.cacheService.deleteMany(keys);
            }
        }
    }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.leaveRepository.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.leaveRepository.createQueryBuilder('leave')
            .withDeleted()
            .where('leave.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(leave.leave_type) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('leave.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.leaveRepository.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.leaveRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.leaveRepository.delete(id);
    }
}
