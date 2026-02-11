import { Inject, Injectable } from '@nestjs/common';
import { Cacheable } from 'cacheable';

@Injectable()
export class CacheService {
  constructor(@Inject('CACHE_INSTANCE') private readonly cache: Cacheable) {}

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
    await this.cache.delete(key);
  }

  async getKeys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.cache.getMany([pattern]);
      return Object.keys(keys || {});
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    
    try {
      await Promise.all(keys.map(key => this.cache.delete(key)));
    } catch (error) {
      console.error('Error deleting multiple keys:', error);
    }
  }
}