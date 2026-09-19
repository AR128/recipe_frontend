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

    const cardStyle = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: '28px 28px',
        marginBottom: 24,
    };

    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px' }}>
                {/* Page heading */}
                <div style={{ marginBottom: 36 }}>
                    <h1
                        className="font-display"
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            margin: '0 0 6px',
                        }}
                    >
                        Settings
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                        Customise your RecipeBite experience.
                    </p>
                </div>

                {/* Theme settings */}
                <div style={cardStyle}>
                    <h2
                        className="font-display"
                        style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}
                    >
                        Appearance
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
                        Choose how RecipeBite looks to you. Your preference is saved locally.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {THEMES.map((t) => {
                            const isSelected = theme === t.value;
                            return (
                                <button
                                    key={t.value}
                                    id={`theme-${t.value}`}
                                    onClick={() => setTheme(t.value)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 18,
                                        padding: '16px 20px',
                                        background: isSelected ? 'var(--color-accent-soft)' : 'var(--color-surface-2)',
                                        border: isSelected
                                            ? '1.5px solid var(--color-accent)'
                                            : '1.5px solid var(--color-border)',
                                        borderRadius: 14,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        transition: 'all 0.15s ease',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.borderColor = 'var(--color-accent)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                        }
                                    }}
                                >
                                    {/* Icon */}
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 12,
                                            background: isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                                            border: '1px solid var(--color-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                                            flexShrink: 0,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {t.icon}
                                    </div>

                                    {/* Labels */}
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
                                            }}
                                        >
                                            {t.label}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: 'var(--color-text-muted)',
                                                marginTop: 2,
                                            }}
                                        >
                                            {t.description}
                                        </div>
                                    </div>

                                    {/* Selected indicator */}
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            border: isSelected ? 'none' : '2px solid var(--color-border)',
                                            background: isSelected ? 'var(--color-accent)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {isSelected && (
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Current theme feedback */}
                    <p
                        style={{
                            marginTop: 16,
                            fontSize: 12,
                            color: 'var(--color-text-muted)',
                            textAlign: 'center',
                        }}
                    >
                        Currently using:{' '}
                        <strong style={{ color: 'var(--color-text-secondary)' }}>
                            {THEMES.find((t) => t.value === theme)?.label}
                        </strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Settings;
