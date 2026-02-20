import { getEnvNumber, getEnvVar } from "../env";

export const API_CONFIG = {
    BASE_URL: getEnvVar('API_BASE_URL', 'https://api.coffee2eat.com/api/v1'),
    TIMEOUT: getEnvNumber('API_TIMEOUT', 10000),
    RETRY_ATTEMPTS: getEnvNumber('API_RETRY_ATTEMPTS', 3),
    RETRY_DELAY: getEnvNumber('API_RETRY_DELAY', 1000),
} as const;

export const STORAGE_KEYS = {
    USER_SESSION: 'userSession',
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

// Additional environment-based configurations
export const APP_CONFIG = {
    ENV: getEnvVar('NODE_ENV', 'development'),
    DEBUG_MODE: getEnvVar('DEBUG_MODE', 'false') === 'true',
    API_VERSION: getEnvVar('API_VERSION', 'v1'),
    APP_NAME: getEnvVar('APP_NAME', 'Coffee Club Go'),
    ENABLE_LOGGING: getEnvVar('ENABLE_LOGGING', 'true') === 'true',
} as const;

// Export individual configs for easier access
export const {
    BASE_URL,
    TIMEOUT,
    RETRY_ATTEMPTS,
    RETRY_DELAY
} = API_CONFIG;

// Development helper
if (__DEV__) {
    console.log('🔧 API Configuration:', {
        BASE_URL: API_CONFIG.BASE_URL,
        TIMEOUT: API_CONFIG.TIMEOUT,
        ENV: APP_CONFIG.ENV,
        DEBUG_MODE: APP_CONFIG.DEBUG_MODE,
    });
}