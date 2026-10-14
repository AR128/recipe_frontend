import { useTheme } from '../context/useTheme';

const THEMES = [
    {
        value: 'light',
        label: 'Light',
        description: 'Clean white interface',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
        ),
    },
    {
        value: 'dark',
        label: 'Dark',
        description: 'Easy on the eyes at night',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        ),
    },
    {
        value: 'system',
        label: 'System Default',
        description: 'Follows your device settings',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
        ),
    },
];

function Settings() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="w-full max-w-2xl mx-auto px-5 py-12 pb-20">
            {/* Page heading */}
            <div className="mb-9">
                <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-1.5">
                    Settings
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Customise your RecipeBite experience.
                </p>
            </div>

            {/* Theme settings Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 mb-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-1.5">
                    Appearance
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                    Choose how RecipeBite looks to you. Your preference is saved locally.
                </p>

                <div className="flex flex-col gap-3">
                    {THEMES.map((t) => {
                        const isSelected = theme === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setTheme(t.value)}
                                className={`flex items-center gap-4 p-4 w-full text-left rounded-xl border-2 transition-all duration-150
                                    ${isSelected 
                                        ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-900 dark:border-white' 
                                        : 'bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`w-11 h-11 flex items-center justify-center rounded-lg shrink-0 transition-colors
                                    ${isSelected 
                                        ? 'bg-neutral-900 dark:bg-white text-neutral-50 dark:text-neutral-900' 
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                                    }`}>
                                    {t.icon}
                                </div>

                                {/* Labels */}
                                <div className="flex-1">
                                    <div className={`text-[15px] font-semibold transition-colors
                                        ${isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                        {t.label}
                                    </div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        {t.description}
                                    </div>
                                </div>

                                {/* Selected indicator */}
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                                    ${isSelected 
                                        ? 'bg-neutral-900 dark:bg-white border-none' 
                                        : 'border-2 border-neutral-300 dark:border-neutral-600'
                                    }`}>
                                    {isSelected && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-neutral-50 dark:text-neutral-900">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Current theme feedback */}
                <p className="mt-6 text-xs text-center text-neutral-500 dark:text-neutral-400">
                    Currently using:{' '}
                    <strong className="text-neutral-800 dark:text-neutral-200">
                        {THEMES.find((t) => t.value === theme)?.label}
                    </strong>
                </p>
            </div>
        </div>
    );
}

export default Settings;