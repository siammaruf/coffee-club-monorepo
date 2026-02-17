import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject('CACHE_INSTANCE') private readonly cache: Cacheable,
    @Inject('REDIS_PREFIX') private readonly redisPrefix: string,
  ) {}

  async get<T>(key: string): Promise<T> {
    const value = await this.cache.get(key);
    if (value === undefined) {
      return undefined as T;
    }
    return value as T;
  }

  async set<T>(key: string, value: T, ttl?: number | string): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    if (key.includes('*')) {
      await this.deleteByPattern(key);
    } else {
      await this.cache.delete(key);
    }
  }

  private async deleteByPattern(pattern: string): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      if (!redisClient) {
        this.logger.warn('Redis client not available for pattern deletion, falling back to clear()');
        await this.cache.clear();
        return;
      }

      // Build the full Redis key pattern including Keyv namespace prefix
      const fullPattern = this.redisPrefix
        ? `keyv:${this.redisPrefix}:${pattern}`
        : `keyv:${pattern}`;

      let cursor = '0';
      let deletedCount = 0;
      do {
        const [nextCursor, keys]: [string, string[]] = await redisClient.scan(
          cursor, 'MATCH', fullPattern, 'COUNT', 100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redisClient.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== '0');

      this.logger.debug(`Deleted ${deletedCount} keys matching pattern: ${fullPattern}`);
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern "${pattern}":`, error);
    }
  }

  private getRedisClient(): any {
    try {
      // Access chain: Cacheable -> secondary (Keyv) -> store (KeyvRedis) -> client (ioredis)
      const secondary = (this.cache as any).secondary;
      return secondary?.store?.client ?? null;
    } catch {
      return null;
    }
  }

  async getKeys(pattern: string): Promise<string[]> {
    try {
      const redisClient = this.getRedisClient();
      if (!redisClient) return [];

      const fullPattern = this.redisPrefix
        ? `keyv:${this.redisPrefix}:${pattern}`
        : `keyv:${pattern}`;

      const found: string[] = [];
      let cursor = '0';
      do {
        const [nextCursor, keys]: [string, string[]] = await redisClient.scan(
          cursor, 'MATCH', fullPattern, 'COUNT', 100,
        );
        cursor = nextCursor;
        found.push(...keys);
      } while (cursor !== '0');

      // Strip the keyv namespace prefix to return app-level keys
      const prefixToStrip = this.redisPrefix
        ? `keyv:${this.redisPrefix}:`
        : 'keyv:';
      return found.map(k => k.startsWith(prefixToStrip) ? k.slice(prefixToStrip.length) : k);
    } catch (error) {
      this.logger.error('Error getting keys:', error);
      return [];
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      await Promise.all(keys.map(key => this.delete(key)));
    } catch (error) {
      this.logger.error('Error deleting multiple keys:', error);
    }
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }
}