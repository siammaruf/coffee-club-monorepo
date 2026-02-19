import { reduxStorage } from '../redux/store/storage';
import { Logger } from './logger';

export class StorageService {
    static async getItem(key: string): Promise<string | null> {
        try {
            return await reduxStorage.getItem(key);
        } catch (error) {
            Logger.logError(`Failed to get ${key} from storage:`, error);
            return null;
        }
    }

    static async setItem(key: string, value: string): Promise<void> {
        try {
            await reduxStorage.setItem(key, value);
        } catch (error) {
            Logger.logError(`Failed to set ${key} to storage:`, error);
        }
    }

    static async removeItem(key: string): Promise<void> {
        try {
            await reduxStorage.removeItem(key);
        } catch (error) {
            Logger.logError(`Failed to remove ${key} from storage:`, error);
        }
    }

    static async getUserSession(): Promise<any | null> {
        try {
            const session = await this.getItem('userSession');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            Logger.logError('Failed to parse user session:', error);
            return null;
        }
    }

    static async setUserSession(userData: any): Promise<void> {
        try {
            await this.setItem('userSession', JSON.stringify(userData));
        } catch (error) {
            Logger.logError('Failed to save user session:', error);
        }
    }

    static async clearUserSession(): Promise<void> {
        await this.removeItem('userSession');
    }

    static async clearMultiple(keys: string[]): Promise<void> {
        await Promise.all(keys.map(key => this.removeItem(key)));
    }
}