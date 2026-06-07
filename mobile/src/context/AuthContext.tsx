import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import axios from 'axios';
import { authService } from '../services/httpServices/authService';
import { httpService } from '../services/httpService';
import { StorageService } from '../services/storageService';
import { API_CONFIG, STORAGE_KEYS } from '../utils/config/api';
import { User } from '../types/user';
import type { LoginFormData } from '../types/auth';
import { isTokenExpired } from '../utils/jwt';

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
            console.error('Login failed:', error?.message || String(error));
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            // 1. Notify backend to invalidate the refresh token BEFORE wiping local state
            // so the interceptor still has the access token to authenticate the request.
            const refreshToken = await StorageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            await authService.logout(refreshToken || undefined);
        } catch (error: any) {
            console.error('Logout API call failed:', error?.message || String(error));
            // Continue with local cleanup even if the server call failed
        }

        try {
            // 2. Wipe all local auth state
            await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            await StorageService.clearUserSession();
            // 3. Clear any cached API responses that may contain sensitive data
            httpService.clearCache();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error: any) {
            console.error('Local logout cleanup failed:', error?.message || String(error));
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Attempts to refresh tokens using the provided refresh token.
     * Uses direct axios to bypass the interceptor and avoid circular refresh loops.
     * On success, stores new tokens and fetches current user from /auth/me.
     */
    const attemptTokenRefresh = useCallback(async (refreshToken: string) => {
        const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
        }, { timeout: API_CONFIG.TIMEOUT });

        const newAccessToken = refreshResponse.data?.data?.access_token;
        const newRefreshToken = refreshResponse.data?.data?.refresh_token;

        if (!newAccessToken) {
            throw new Error('Token refresh did not return access token');
        }

        await StorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
        if (newRefreshToken) {
            await StorageService.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Verify the new access token by fetching current user
        const meResponse = await authService.checkAuthStatus();
        const userRole = meResponse.data?.role?.toLowerCase();
        if (userRole !== 'manager') {
            await StorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await StorageService.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            await StorageService.clearUserSession();
            setUser(null);
            setIsAuthenticated(false);
            throw new Error('Access denied. Only managers are allowed.');
        }

        await StorageService.setUserSession(meResponse.data);
        setUser(meResponse.data);
        setIsAuthenticated(true);
    }, []);

    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const accessToken = await StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const refreshToken = await StorageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);

            // No tokens at all -> definitely logged out
            if (!accessToken && !refreshToken) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            // Access token missing but refresh token exists -> refresh immediately
            if (!accessToken && refreshToken) {
                await attemptTokenRefresh(refreshToken);
                return;
            }

            // Access token exists but is expired or about to expire -> refresh proactively
            if (accessToken && isTokenExpired(accessToken, 300)) {
                if (refreshToken) {
                    await attemptTokenRefresh(refreshToken);
                    return;
                }
                // Expired and no refresh token -> logout
                await logout();
                return;
            }

            // Access token is valid; verify with server
            const response = await authService.checkAuthStatus();
            const userRole = response.data?.role?.toLowerCase();
            if (userRole !== 'manager') {
                await logout();
                return;
            }

            await StorageService.setUserSession(response.data);
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Auth check failed:', error?.message || String(error));

            // If tokens are gone, the interceptor or our refresh logic already cleared them.
            const accessToken = await StorageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const refreshToken = await StorageService.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!accessToken && !refreshToken) {
                setUser(null);
                setIsAuthenticated(false);
                return;
            }

            // For transient errors (network, timeout, 5xx), keep cached session
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
    }, [attemptTokenRefresh, logout]);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Refresh auth when app comes back from background to prevent token expiry issues
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                // Re-run the full auth check instead of calling the API directly.
                // This ensures consistent state handling, offline fallback, and loading state.
                checkAuthStatus().catch(error => {
                    console.error('AppState auth refresh failed:', error?.message || String(error));
                });
            }
        });
        return () => subscription.remove();
    }, [checkAuthStatus]);

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
