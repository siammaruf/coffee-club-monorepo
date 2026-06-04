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
  private refreshSubscribers: Array<(token: string | null) => void> = [];

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
