import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const deviceColorScheme = useDeviceColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');

    const resolvedTheme: 'light' | 'dark' =
        themeMode === 'system'
            ? (deviceColorScheme === 'dark' ? 'dark' : 'light')
            : themeMode;

    const value: ThemeContextType = {
        theme: resolvedTheme,
        themeMode,
        setThemeMode,
        isDark: resolvedTheme === 'dark',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
