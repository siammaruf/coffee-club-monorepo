import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from './modules/cache/cache.service';
import { Order } from './modules/orders/entities/order.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cacheService: CacheService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    services: {
      database: { status: string; latencyMs: number };
      redis: { status: string; latencyMs: number };
    };
  }> {
    const start = Date.now();

    // Check DB
    let dbStatus = 'ok';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await this.orderRepository.query('SELECT 1');
      dbLatency = Date.now() - dbStart;
    } catch {
      dbStatus = 'error';
    }

    // Check Redis
    let redisStatus = 'ok';
    let redisLatency = 0;
    try {
      const redisStart = Date.now();
      await this.cacheService.set('health:check', 'ok', 5);
      const check = await this.cacheService.get<string>('health:check');
      if (check !== 'ok') {
        redisStatus = 'error';
      }
      redisLatency = Date.now() - redisStart;
    } catch {
      redisStatus = 'error';
    }

    const totalLatency = Date.now() - start;
    const overallStatus = dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: { status: dbStatus, latencyMs: dbLatency },
        redis: { status: redisStatus, latencyMs: redisLatency },
      },
    };
  }
}
