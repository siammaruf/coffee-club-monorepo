import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import type { ApiErrorResponse } from '../types/HttpService';
import { API_CONFIG } from '../utils/config/api';
import { handleAxiosError } from '../utils/errorHandler';
import { StorageService } from './storageService';
import { STORAGE_KEYS } from '../utils/config/api';

interface CacheEntry {
  data: any;
  expiry: number;
}

class HttpService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<any>>();
  private readonly CACHE_TTL_MS = 15000; // 15 seconds cache for GET requests

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      withCredentials: false, // Mobile uses Bearer tokens, not cookies
      timeout: API_CONFIG.TIMEOUT,
    });

    // Request interceptor - attach Bearer token
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Skip auth header for refresh token request to avoid circular dependency
        if (config.url?.includes('/auth/refresh')) {
          return config;
        }

        const token = await StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
          if (config.headers['Content-Type']) {
            delete config.headers['Content-Type'];
          }
        } else {
          config.headers['Content-Type'] = 'application/json';
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor with automatic token refresh on 401
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request until refresh is complete
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push((token: string | null) => {
                if (!token) {
                  reject(new Error('Token refresh failed'));
                  return;
                }
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await StorageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
              // No refresh token means auth is permanently broken; clear everything
              await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              await StorageService.clearUserSession();
              throw new Error('No refresh token available');
            }

            // Use direct axios for refresh to avoid circular dependency with authService
            const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            }, { timeout: API_CONFIG.TIMEOUT });
            const newAccessToken = refreshResponse.data?.data?.access_token;
            const newRefreshToken = refreshResponse.data?.data?.refresh_token;

            if (!newAccessToken) {
              throw new Error('Refresh token response did not contain access_token');
            }

            await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
            if (newRefreshToken) {
              await StorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }

            // Notify all queued requests
            this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
            this.refreshSubscribers = [];

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.api(originalRequest);
          } catch (refreshError: any) {
            // Clear auth only if the server explicitly rejected the refresh token (401).
            // For network errors, timeouts, or server errors, keep the tokens
            // so the user stays logged in and the next request can retry.
            const isAuthError = refreshError?.response?.status === 401;
            if (isAuthError) {
              await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              await StorageService.clearUserSession();
            }
            // Reject all queued requests so they don't hang forever
            this.refreshSubscribers.forEach((callback) => callback(null));
            this.refreshSubscribers = [];
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private buildCacheKey(url: string, config?: AxiosRequestConfig): string {
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `${url}|${params}`;
  }

  private shouldCache(url: string): boolean {
    // Only cache safe, idempotent GET requests that are not auth-related
    if (!url) return false;
    const noCachePaths = ['/auth/', '/login', '/logout', '/refresh', '/me'];
    return !noCachePaths.some((path) => url.includes(path));
  }

  private async requestWithRetry<T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const maxRetries = API_CONFIG.RETRY_ATTEMPTS || 3;
    const retryDelay = API_CONFIG.RETRY_DELAY || 1000;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let response;
        switch (method) {
          case 'get':
            response = await this.api.get<T>(url, config);
            break;
          case 'post':
            response = await this.api.post<T>(url, data, config);
            break;
          case 'put':
            response = await this.api.put<T>(url, data, config);
            break;
          case 'delete':
            response = await this.api.delete<T>(url, config);
            break;
          case 'patch':
            response = await this.api.patch<T>(url, data, config);
            break;
        }
        return response.data;
      } catch (error: any) {
        lastError = error;
        const isNetworkError = !error.response;
        const isTimeout = error.code === 'ECONNABORTED';
        const isServerError = error.response?.status >= 500;
        const isRetryable = isNetworkError || isTimeout || isServerError;

        if (!isRetryable || attempt >= maxRetries) {
          break;
        }

        // Exponential backoff: delay * 2^attempt (max 5s)
        const delay = Math.min(retryDelay * Math.pow(2, attempt), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw handleAxiosError(lastError);
  }

  public async get<T>(url: string, config?: AxiosRequestConfig<any>) {
    const cacheKey = this.buildCacheKey(url, config);

    // Return cached data immediately for GET requests
    if (this.shouldCache(url)) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T;
      }
    }

    // Deduplicate concurrent identical requests
    const inFlightKey = `GET|${cacheKey}`;
    if (this.inFlight.has(inFlightKey)) {
      return this.inFlight.get(inFlightKey) as Promise<T>;
    }

    const requestPromise = this.requestWithRetry<T>('get', url, undefined, config)
      .then((data) => {
        if (this.shouldCache(url)) {
          this.cache.set(cacheKey, { data, expiry: Date.now() + this.CACHE_TTL_MS });
        }
        this.inFlight.delete(inFlightKey);
        return data;
      })
      .catch((error) => {
        this.inFlight.delete(inFlightKey);
        throw error;
      });

    this.inFlight.set(inFlightKey, requestPromise);
    return requestPromise;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig<any>) {
    // Invalidate cache on mutations to keep data fresh
    this.invalidateRelatedCache(url);
    return this.requestWithRetry<T>('post', url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig<any>) {
    this.invalidateRelatedCache(url);
    return this.requestWithRetry<T>('put', url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig<any>) {
    this.invalidateRelatedCache(url);
    return this.requestWithRetry<T>('delete', url, undefined, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig<any>) {
    this.invalidateRelatedCache(url);
    return this.requestWithRetry<T>('patch', url, data, config);
  }

  private invalidateRelatedCache(url: string): void {
    // Simple heuristic: if a mutation happens on /orders/123, clear all cache keys starting with /orders
    const segments = url.split('/').filter(Boolean);
    if (segments.length >= 1) {
      const resource = `/${segments[0]}`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(resource)) {
          this.cache.delete(key);
        }
      }
    }
  }

  public clearCache(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const httpService = new HttpService();
