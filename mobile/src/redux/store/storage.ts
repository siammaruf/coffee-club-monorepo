import type { Storage } from 'redux-persist';

type MMKVLike = {
    set: (key: string, value: string) => void;
    getString: (key: string) => string | undefined;
    delete: (key: string) => void;
};

function createStorage(): MMKVLike {
    try {
        const { MMKV } = require('react-native-mmkv');
        return new MMKV();
    } catch {
        const map = new Map<string, string>();
        return {
            set: (key, value) => map.set(key, value),
            getString: (key) => map.get(key),
            delete: (key) => {
                map.delete(key);
            },
        };
    }
}

const storage = createStorage();

export const reduxStorage: Storage = {
    setItem: (key, value) => {
        storage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: (key) => {
        const value = storage.getString(key);
        return Promise.resolve(value);
    },
    removeItem: (key) => {
        storage.delete(key);
        return Promise.resolve();
    },
};
