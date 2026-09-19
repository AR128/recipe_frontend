import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext.js';

const STORAGE_KEY = 'recipebite-theme';

// Apply the resolved theme to the document
const applyTheme = (preference) => {
    const root = document.documentElement;

    if (preference === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', preference);
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || 'system';
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Listen for system theme changes when preference is "system"
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = (newTheme) => {
        localStorage.setItem(STORAGE_KEY, newTheme);
        setThemeState(newTheme);
        applyTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
