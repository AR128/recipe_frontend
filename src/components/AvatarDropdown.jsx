import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';

function getInitials(user) {
    if (!user) return '?';
    const name = user.name || user.username || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '?';
}

function AvatarDropdown() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate('/');
    };

    const initials = getInitials(user);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
                id="avatar-menu-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label="Open user menu"
                aria-expanded={open}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    border: '2px solid var(--color-accent)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: open ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transform: open ? 'scale(1.05)' : 'scale(1)',
                    flexShrink: 0,
                }}
            >
                {initials}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="animate-fade-in"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        minWidth: 210,
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 14,
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        zIndex: 100,
                    }}
                >
                    {/* User info header */}
                    <div
                        style={{
                            padding: '14px 16px 10px',
                            borderBottom: '1px solid var(--color-border)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user?.name || user?.username}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: 'var(--color-text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginTop: 2,
                            }}
                        >
                            {user?.email}
                        </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px 0' }}>
                        <DropdownItem
                            id="dropdown-my-account"
                            to="/account"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            }
                            label="MY ACCOUNT"
                            onClick={() => setOpen(false)}
                        />
                        <DropdownItem
                            id="dropdown-create-post"
                            to="/create-post"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            }
                            label="CREATE A POST"
                            onClick={() => setOpen(false)}
                        />
                        <DropdownItem
                            id="dropdown-settings"
                            to="/settings"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                </svg>
                            }
                            label="SETTINGS"
                            onClick={() => setOpen(false)}
                        />
                    </div>


                    {/* Logout */}
                    <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0' }}>
                        <button
                            id="dropdown-logout"
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '9px 16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--color-accent)',
                                textAlign: 'left',
                                transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent-soft)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DropdownItem({ to, icon, label, onClick, id }) {
    return (
        <Link
            id={id}
            to={to}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
            <span style={{ color: 'var(--color-text-secondary)' }}>{icon}</span>
            {label}
        </Link>
    );
}

export default AvatarDropdown;
