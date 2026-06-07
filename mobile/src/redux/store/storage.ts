import type { Storage } from 'redux-persist';
import Constants from 'expo-constants';

type MMKVLike = {
    set: (key: string, value: string) => void;
    getString: (key: string) => string | undefined;
    remove: (key: string) => boolean;
};

function createDefaultStorage(): MMKVLike {
    try {
        const { createMMKV } = require('react-native-mmkv');
        const mmkv = createMMKV();
        // Verify MMKV is actually functional by doing a test read/write
        const testKey = '__mmkv_test__';
        const testValue = '__test_value__';
        mmkv.set(testKey, testValue);
        const readValue = mmkv.getString(testKey);
        mmkv.remove(testKey);
        if (readValue !== testValue) {
            throw new Error('MMKV read/write verification failed');
        }
        return mmkv;
    } catch (error: any) {
        throw new Error(
            `Failed to initialize MMKV storage: ${error?.message || error}. ` +
            'Auth tokens and app data will NOT persist across app restarts. ' +
            'Ensure react-native-mmkv is properly linked for your platform. '
        );
    }
}

const bundleId = Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier || 'com.coffeeclub.go';
const baseKey = `${bundleId}-cc-go-v1`;
// MMKV encryptionKey should be exactly 32 bytes for AES-256
const ENCRYPTION_KEY = baseKey.length >= 32 ? baseKey.slice(0, 32) : baseKey.padEnd(32, 'x');

function createSecureStorage(): MMKVLike {
    try {
        const { createMMKV } = require('react-native-mmkv');
        const mmkv = createMMKV({
            id: 'coffee-club-secure',
            encryptionKey: ENCRYPTION_KEY,
        });

        // One-time migration: move existing auth tokens from the default (unencrypted)
        // instance into the new encrypted instance so users are not logged out on update.
        try {
            const defaultMmkv = createMMKV();
            const authKeys = ['authToken', 'refreshToken', 'userSession'];
            for (const key of authKeys) {
                const value = defaultMmkv.getString(key);
                if (value) {
                    mmkv.set(key, value);
                    defaultMmkv.remove(key);
                }
            }
        } catch {
            // Ignore migration errors; worst case user logs in again
        }

        // Verify encrypted storage works
        const testKey = '__secure_test__';
        const testValue = '__test__';
        mmkv.set(testKey, testValue);
        const readValue = mmkv.getString(testKey);
        mmkv.remove(testKey);
        if (readValue !== testValue) {
            throw new Error('Secure MMKV read/write verification failed');
        }
        return mmkv;
    } catch (error: any) {
        throw new Error(
            `Failed to initialize secure MMKV storage: ${error?.message || error}. ` +
            'Auth tokens will NOT be stored encrypted. ' +
            'Ensure react-native-mmkv is properly linked for your platform. '
        );
    }
}

const defaultStorage = createDefaultStorage();
const secureStorage = createSecureStorage();

export const reduxStorage: Storage = {
    setItem: (key, value) => {
        defaultStorage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: (key) => {
        const value = defaultStorage.getString(key);
        return Promise.resolve(value);
    },
    removeItem: (key) => {
        defaultStorage.remove(key);
        return Promise.resolve();
    },
};

export const secureMmkvStorage: Storage = {
    setItem: (key, value) => {
        secureStorage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: (key) => {
        const value = secureStorage.getString(key);
        return Promise.resolve(value);
    },
    removeItem: (key) => {
        secureStorage.remove(key);
        return Promise.resolve();
    },
};
