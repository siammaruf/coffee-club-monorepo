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

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      withCredentials: true,
      timeout: API_CONFIG.TIMEOUT,
    });

    // Request interceptor - attach Bearer token
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log('Making request to:', (config.baseURL ?? '') + config.url);

        // Attach Bearer token from storage
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

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('Response received from:', response.config.url);
        return response;
      },
      (error: AxiosError<ApiErrorResponse>) => {
        // console.error('Response interceptor error:', {
        //   message: error.message,
        //   code: error.code,
        //   status: error.response?.status,
        //   url: error.config?.url,
        // });
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