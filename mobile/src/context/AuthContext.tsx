import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, AppState } from 'react-native';
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

            // Store tokens for Bearer authentication
            const accessToken = response.data?.access_token;
            const refreshToken = response.data?.refresh_token;
            if (accessToken) {
                await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
            }
            if (refreshToken) {
                await StorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
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
            await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
            // If there is no access token, skip the API call to avoid an unnecessary 401
            // that triggers a refresh attempt with a missing refresh token.
            const accessToken = await StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (!accessToken) {
                const cachedSession = await StorageService.getUserSession();
                if (cachedSession) {
                    setUser(cachedSession);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
                return;
            }

            const response = await authService.checkAuthStatus();

            const userRole = response.data?.role?.toLowerCase();
            if (userRole !== 'manager') {
                await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                await StorageService.clearUserSession();
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            await StorageService.setUserSession(response.data);
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error: any) {
            // If tokens are gone, the interceptor already cleared them due to an
            // irrecoverable auth failure (401 or missing refresh token).
            const accessToken = await StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const refreshToken = await StorageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!accessToken && !refreshToken) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            // For transient errors (network, timeout, 5xx), keep the cached session
            // so the user isn't kicked out when offline or on a slow connection.
            const cachedSession = await StorageService.getUserSession();
            if (cachedSession) {
                setUser(cachedSession);
                setIsAuthenticated(true);
            } else {
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

    // Refresh auth when app comes back from background to prevent token expiry issues
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                authService.checkAuthStatus().then((response) => {
                    const userRole = response.data?.role?.toLowerCase();
                    if (userRole === 'manager') {
                        StorageService.setUserSession(response.data);
                        setUser(response.data);
                        setIsAuthenticated(true);
                    } else {
                        StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                        StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                        StorageService.clearUserSession();
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }).catch(async () => {
                    // If the interceptor cleared tokens during the catch, update state
                    const accessToken = await StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
                    const refreshToken = await StorageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                    if (!accessToken && !refreshToken) {
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                    // Otherwise it's a transient error; keep current state
                });
            }
        });
        return () => subscription.remove();
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
