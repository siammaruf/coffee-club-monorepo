import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// Environment variables with fallbacks
// Reads from: Expo config extra → EXPO_PUBLIC_* env vars → hardcoded fallback
export const getEnvVar = (key: string, fallback: string): string => {
    return extra[key] || process.env[`EXPO_PUBLIC_${key}`] || fallback;
};

export const getEnvNumber = (key: string, fallback: number): number => {
    const value = extra[key] || process.env[`EXPO_PUBLIC_${key}`];
    return value ? parseInt(String(value), 10) : fallback;
};