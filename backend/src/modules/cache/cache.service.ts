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

      // Build the full Redis key pattern matching @keyv/redis v5 storage format: {namespace}:{key}
      const fullPattern = this.redisPrefix
        ? `${this.redisPrefix}:${pattern}`
        : pattern;

      const keysToDelete: string[] = [];
      let cursor: string | number = '0';
      do {
        const result = await redisClient.scan(cursor, {
          MATCH: fullPattern,
          COUNT: 100,
        });
        // Support both ioredis ([cursor, keys]) and node-redis ({ cursor, keys })
        let nextCursor: string | number;
        let keys: string[];
        if (Array.isArray(result)) {
          [nextCursor, keys] = result;
        } else {
          nextCursor = result.cursor;
          keys = result.keys;
        }
        cursor = nextCursor;
        keysToDelete.push(...keys);
      } while (String(cursor) !== '0');

      if (keysToDelete.length > 0) {
        // Delete from Redis in batches to avoid argument limits
        const batchSize = 100;
        for (let i = 0; i < keysToDelete.length; i += batchSize) {
          const batch = keysToDelete.slice(i, i + batchSize);
          await redisClient.del(...batch);
        }

        // Also delete from primary (in-memory) cache. Cacheable.delete()
        // removes from both tiers, so we pass the app-level key to clear
        // the in-memory layer as well.
        for (const key of keysToDelete) {
          const appKey = this.redisPrefix && key.startsWith(`${this.redisPrefix}:`)
            ? key.slice(`${this.redisPrefix}:`.length)
            : key;
          try {
            await this.cache.delete(appKey);
          } catch {
            // Ignore errors deleting from primary cache
          }
        }
      }

      this.logger.debug(`Deleted ${keysToDelete.length} keys matching pattern: ${fullPattern}`);
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern "${pattern}":`, error);
      // Aggressive fallback: clear entire cache to prevent stale permission/user data
      this.logger.warn('Falling back to cache.clear() due to pattern deletion failure');
      await this.cache.clear();
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
        ? `${this.redisPrefix}:${pattern}`
        : pattern;

      const found: string[] = [];
      let cursor: string | number = '0';
      do {
        const result = await redisClient.scan(cursor, {
          MATCH: fullPattern,
          COUNT: 100,
        });
        let nextCursor: string | number;
        let keys: string[];
        if (Array.isArray(result)) {
          [nextCursor, keys] = result;
        } else {
          nextCursor = result.cursor;
          keys = result.keys;
        }
        cursor = nextCursor;
        found.push(...keys);
      } while (String(cursor) !== '0');

      // Strip the namespace prefix to return app-level keys
      const prefixToStrip = this.redisPrefix
        ? `${this.redisPrefix}:`
        : '';
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