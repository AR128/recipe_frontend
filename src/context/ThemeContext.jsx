import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext.js';

const STORAGE_KEY = 'recipebite-theme';

// Apply the resolved theme to the document
const applyTheme = (preference) => {
    const root = document.documentElement;
    let isDark = false;

    if (preference === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDark = preference === 'dark';
    }

    // This toggles Tailwind's 'dark' class AND keeps your data-theme attribute
    if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
    } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
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