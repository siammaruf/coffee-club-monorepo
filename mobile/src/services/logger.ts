import { AxiosRequestConfig, AxiosResponse } from 'axios';

export class Logger {
    static logRequest(config: AxiosRequestConfig) {
        if (__DEV__) {
            console.log('🚀 HTTP Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                baseURL: config.baseURL,
                data: config.data,
                params: config.params,
            });
        }
    }

    static logResponse(response: AxiosResponse) {
        if (__DEV__) {
            console.log('✅ HTTP Response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.config.url,
                data: response.data,
            });
        }
    }

    static logInfo(message: string, data?: any) {
        if (__DEV__) {
            console.log(`ℹ️ ${message}`, data || '');
        }
    }

    static logWarning(message: string, data?: any) {
        if (__DEV__) {
            console.warn(`⚠️ ${message}`, data || '');
        }
    }

    static logError(message: string, error?: any) {
        if (__DEV__) {
            console.error(`❌ ${message}`, error || '');
        }
    }
}