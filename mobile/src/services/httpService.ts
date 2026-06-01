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
class HttpService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

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
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
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
              throw new Error('No refresh token available');
            }

            // Use direct axios for refresh to avoid circular dependency with authService
            const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            }, { timeout: API_CONFIG.TIMEOUT });
            const newAccessToken = refreshResponse.data?.data?.access_token;

            if (!newAccessToken) {
              throw new Error('Refresh token response did not contain access_token');
            }

            await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);

            // Notify all queued requests
            this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
            this.refreshSubscribers = [];

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed — clear auth state and reject
            await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            await StorageService.clearUserSession();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Enhanced error handling for HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig<any>) {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig<any>) {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig<any>) {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig<any>) {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig<any>) {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  }
}

export const httpService = new HttpService();
