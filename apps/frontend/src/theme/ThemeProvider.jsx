import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppTheme } from './createTheme';

const THEME_STORAGE_KEY = '@toplight/theme-mode';
const ThemeContext = createContext(null);

export function AppThemeProvider({ children }) {
    const [mode, setMode] = useState('light');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadThemeMode = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (isMounted && (savedMode === 'light' || savedMode === 'dark')) {
                    setMode(savedMode);
                }
            } catch (error) {
                console.error('[ThemeProvider] Unable to load saved theme:', error);
            } finally {
                if (isMounted) setIsReady(true);
            }
        };

        loadThemeMode();
        return () => {
            isMounted = false;
        };
    }, []);

    const theme = useMemo(() => createAppTheme(mode), [mode]);

    useEffect(() => {
        Appearance.setColorScheme(theme.mode);
    }, [theme.mode]);

    const setThemeMode = useCallback(async nextMode => {
        if (nextMode !== 'light' && nextMode !== 'dark') {
            throw new Error(`Unsupported theme mode: ${nextMode}`);
        }
        await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
        setMode(nextMode);
    }, []);

    const toggleTheme = useCallback(
        () => setThemeMode(theme.isDark ? 'light' : 'dark'),
        [setThemeMode, theme.isDark],
    );

    const value = useMemo(
        () => ({ mode, isDark: theme.isDark, isReady, theme, setThemeMode, toggleTheme }),
        [isReady, mode, setThemeMode, theme, toggleTheme],
    );

    return (
        <ThemeContext.Provider value={value}>
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.statusBar}
                translucent={false}
            />
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used inside AppThemeProvider.');
    }
    return context;
}
