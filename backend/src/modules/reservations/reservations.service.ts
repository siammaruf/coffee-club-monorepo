import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from './enum/reservation-status.enum';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly cacheService: CacheService,
  ) {}

  private async invalidateCache(): Promise<void> {
    const patterns = ['reservations:*', 'reservation:*'];
    for (const pattern of patterns) {
      const keys = await this.cacheService.getKeys(pattern);
      if (keys.length > 0) {
        await this.cacheService.deleteMany(keys);
      }
    }
  }

  async create(dto: CreateReservationDto, customerId?: string): Promise<Reservation> {
    // Validate date is today or in the future
    const reservationDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      throw new BadRequestException('Reservation date must be today or in the future.');
    }

    const reservation = this.reservationRepository.create({
      ...dto,
      customer_id: customerId || null,
      special_requests: dto.special_requests || null,
    });

    const saved = await this.reservationRepository.save(reservation);
    await this.invalidateCache();
    return saved;
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    status?: ReservationStatus;
  }): Promise<{ data: Reservation[]; total: number }> {
    const { page, limit, search, status } = options;
    const cacheKey = `reservations:page:${page}:limit:${limit}:search:${search || 'none'}:status:${status || 'none'}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      const query = this.reservationRepository.createQueryBuilder('reservation');

      if (status) {
        query.andWhere('reservation.status = :status', { status });
      }

      if (search) {
        query.andWhere(
          '(LOWER(reservation.name) LIKE :search OR LOWER(reservation.email) LIKE :search OR reservation.phone LIKE :search)',
          { search: `%${search.toLowerCase()}%` },
        );
      }

      query.orderBy('reservation.date', 'ASC')
        .addOrderBy('reservation.time', 'ASC')
        .addOrderBy('reservation.id', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await query.getManyAndCount();
      return { data, total };
    }, 120);
  }

  async findOne(id: string): Promise<Reservation> {
    const cacheKey = `reservation:${id}`;
    return this.cacheService.getOrSet(cacheKey, async () => {
      const reservation = await this.reservationRepository.findOne({
        where: { id },
        relations: ['customer'],
      });
      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${id} not found`);
      }
      return reservation;
    }, 120);
  }

  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (dto.date) {
      const reservationDate = new Date(dto.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (reservationDate < today) {
        throw new BadRequestException('Reservation date must be today or in the future.');
      }
    }

    if (dto.name !== undefined) reservation.name = dto.name;
    if (dto.email !== undefined) reservation.email = dto.email;
    if (dto.phone !== undefined) reservation.phone = dto.phone;
    if (dto.date !== undefined) reservation.date = dto.date;
    if (dto.time !== undefined) reservation.time = dto.time;
    if (dto.party_size !== undefined) reservation.party_size = dto.party_size;
    if (dto.event_type !== undefined) reservation.event_type = dto.event_type;
    if (dto.special_requests !== undefined) reservation.special_requests = dto.special_requests || null;
    if (dto.status !== undefined) reservation.status = dto.status;

    const updated = await this.reservationRepository.save(reservation);
    await this.invalidateCache();
    return updated;
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.softDelete(id);
    await this.invalidateCache();
  }

  // Customer-facing

  async findByCustomer(customerId: string, options: {
    page: number;
    limit: number;
  }): Promise<{ data: Reservation[]; total: number }> {
    const { page, limit } = options;
    const cacheKey = `reservations:customer:${customerId}:page:${page}:limit:${limit}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      const query = this.reservationRepository.createQueryBuilder('reservation')
        .where('reservation.customer_id = :customerId', { customerId })
        .orderBy('reservation.date', 'DESC')
        .addOrderBy('reservation.time', 'DESC')
        .addOrderBy('reservation.id', 'ASC')
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await query.getManyAndCount();
      return { data, total };
    }, 120);
  }

    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.reservationRepository.softDelete(ids);
        await this.invalidateCache();
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.reservationRepository.createQueryBuilder('reservation')
            .withDeleted()
            .where('reservation.deleted_at IS NOT NULL');

        if (search) {
            query.andWhere('LOWER(reservation.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
        }

        query.orderBy('reservation.deleted_at', 'DESC')
            .addOrderBy('reservation.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.reservationRepository.restore(id);
        await this.invalidateCache();
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.reservationRepository.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(`Record with ID ${id} not found`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(`Record with ID ${id} is not in trash`);
        }
        await this.reservationRepository.delete(id);
        await this.invalidateCache();
    }

    async bulkRestore(ids: string[]): Promise<void> {
        await this.reservationRepository.restore(ids);
        await this.invalidateCache();
    }

    async bulkPermanentDelete(ids: string[]): Promise<{ deleted: string[]; failed: { id: string; reason: string }[] }> {
        const deleted: string[] = [];
        const failed: { id: string; reason: string }[] = [];

        for (const id of ids) {
            try {
                const entity = await this.reservationRepository.findOne({
                    where: { id },
                    withDeleted: true,
                });
                if (!entity) {
                    failed.push({ id, reason: 'Record not found' });
                    continue;
                }
                if (!entity.deleted_at) {
                    failed.push({ id, reason: 'Record is not in trash' });
                    continue;
                }
                await this.reservationRepository.delete(id);
                deleted.push(id);
            } catch (error) {
                failed.push({ id, reason: error?.message || 'Unknown error' });
            }
        }

        await this.invalidateCache();
        return { deleted, failed };
    }
}
