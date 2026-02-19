import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/httpServices/authService';
import { StorageService } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/config/api';
import { User } from '../types/user';
import type { LoginFormData } from '../types/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginFormData) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (credentials: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            console.log('Login response:', response);

            const loginUser = response.data?.user;
            const userRole = loginUser?.role?.toLowerCase();
            if (userRole !== 'manager') {
                Alert.alert(
                    'Access Denied',
                    'Only managers are allowed to access this application.',
                    [{ text: 'OK' }]
                );
                throw new Error('Access denied. Only managers are allowed to login.');
            }

            // Store auth token for Bearer authentication
            const token = response.data?.token;
            if (token) {
                await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            }

            await StorageService.setUserSession(loginUser);
            setUser(loginUser ?? null);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await StorageService.clearUserSession();
            authService.logout().catch(error => {
                console.error('Logout API failed:', error);
            });
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const checkAuthStatus = async () => {
        setIsLoading(true);
        try {
            const response = await authService.checkAuthStatus();
            console.log('Auth status response:', response);

            const userRole = response.data?.role?.toLowerCase();
            if (userRole !== 'manager') {
                await StorageService.clearUserSession();
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            await StorageService.setUserSession(response.data);
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error: any) {
            const cachedUser = await StorageService.getUserSession();
            if (cachedUser && cachedUser.role?.toLowerCase() === 'manager') {
                setUser(cachedUser);
                console.log('Using cached user session');
            } else {
                await StorageService.clearUserSession();
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
