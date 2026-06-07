import { AxiosRequestConfig, AxiosResponse } from 'axios';

const SENSITIVE_KEYS = new Set([
  'password',
  'refresh_token',
  'access_token',
  'token',
  'authorization',
  'Authorization',
  'x-api-key',
  'apiKey',
  'client_secret',
  'secret',
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.has(key) || SENSITIVE_KEYS.has(lower) || lower.includes('token') || lower.includes('password') || lower.includes('secret');
}

function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // If the string looks like a JWT or long token, redact it
    if (data.length > 40 && (data.startsWith('eyJ') || data.includes('Bearer '))) {
      return '***REDACTED***';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  }
  return data;
}

export class Logger {
    static logRequest(config: AxiosRequestConfig) {
        if (__DEV__) {
            console.log('🚀 HTTP Request:', sanitize({
                method: config.method?.toUpperCase(),
                url: config.url,
                baseURL: config.baseURL,
                data: config.data,
                params: config.params,
                headers: config.headers,
            }));
        }
    }

    static logResponse(response: AxiosResponse) {
        if (__DEV__) {
            console.log('✅ HTTP Response:', sanitize({
                status: response.status,
                statusText: response.statusText,
                url: response.config.url,
                data: response.data,
            }));
        }
    }

    static logInfo(message: string, data?: any) {
        if (__DEV__) {
            console.log(`ℹ️ ${message}`, sanitize(data) ?? '');
        }
    }

    static logWarning(message: string, data?: any) {
        if (__DEV__) {
            console.warn(`⚠️ ${message}`, sanitize(data) ?? '');
        }
    }

    static logError(message: string, error?: any) {
        if (__DEV__) {
            // Avoid logging full Error objects that may contain request configs with tokens
            let safeError: any;
            if (error && typeof error === 'object') {
                if (error.message) {
                    safeError = error.message;
                } else if (error.toString && typeof error.toString === 'function') {
                    safeError = error.toString();
                } else {
                    safeError = sanitize(error);
                }
            } else {
                safeError = error;
            }
            console.error(`❌ ${message}`, safeError ?? '');
        }
    }
}
