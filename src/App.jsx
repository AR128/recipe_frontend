import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from './context/useAuth';
import AvatarDropdown from './components/AvatarDropdown';
import useWindowWidth from './hooks/useWindowWidth';

function getInitials(user) {
    if (!user) return '?';
    const name = user.name || user.username || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '?';
}

function App() {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { isMobile } = useWindowWidth();
    const [menuOpen, setMenuOpen] = useState(false);

    // Always scroll to top when opening a new page / route
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    const [prevPathname, setPrevPathname] = useState(location.pathname);

    // Close mobile menu on route change (during render to avoid cascading useEffect renders)
    if (location.pathname !== prevPathname) {
        setPrevPathname(location.pathname);
        setMenuOpen(false);
    }

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate('/');
    };

    const isAuthPage =
        location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg)',
                color: 'var(--color-text-primary)',
                transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
        >
            {/* Navigation */}
            {!isAuthPage && (
                <nav
                    style={{
                        background: 'var(--color-surface)',
                        borderBottom: '1px solid var(--color-border)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 50,
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1200,
                            margin: '0 auto',
                            padding: isMobile ? '0 14px' : '0 20px',
                            height: isMobile ? 52 : 58,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Brand */}
                        <Link
                            to="/"
                            id="nav-brand"
                            style={{
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                flexShrink: 0,
                            }}
                        >
                            <span style={{ fontSize: 18, lineHeight: 1 }}>🍽️</span>
                            <span
                                style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontSize: isMobile ? 15 : 18,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    letterSpacing: '0.02em',
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Food Recipe
                            </span>
                        </Link>

                        {/* Desktop: Right side */}
                        {!isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {isAuthenticated ? (
                                    <AvatarDropdown />
                                ) : (
                                    <>
                                        <Link
                                            id="nav-login"
                                            to="/login"
                                            style={{
                                                textDecoration: 'none',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: 'var(--color-text-secondary)',
                                                padding: '7px 14px',
                                                borderRadius: 8,
                                                transition: 'color 0.15s ease, background 0.15s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'var(--color-text-primary)';
                                                e.currentTarget.style.background = 'var(--color-surface-2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            id="nav-signup"
                                            to="/signup"
                                            style={{
                                                textDecoration: 'none',
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: '#fff',
                                                background: 'var(--color-accent)',
                                                padding: '7px 18px',
                                                borderRadius: 8,
                                                transition: 'background 0.15s ease',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mobile: ONLY Three Horizontal Bars button */}
                        {isMobile && (
                            <button
                                id="mobile-menu-btn"
                                aria-label="Open navigation menu"
                                onClick={() => setMenuOpen(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 6,
                                    color: 'var(--color-text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 8,
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                </nav>
            )}

            {/* Mobile Navigation Drawer */}
            {menuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="mobile-nav-overlay"
                        onClick={() => setMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="mobile-nav-drawer">
                        {/* Drawer header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--color-border)',
                        }}>
                            <span style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 16,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                            }}>
                                🍽️ Menu
                            </span>
                            <button
                                aria-label="Close menu"
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 22,
                                    padding: 4,
                                    lineHeight: 1,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* User info header inside drawer if authenticated */}
                        {isAuthenticated && user && (
                            <div style={{
                                padding: '14px 20px',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                background: 'var(--color-surface-2)',
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'var(--color-accent)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {getInitials(user)}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: 'var(--color-text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {user.name || user.username}
                                    </div>
                                    <div style={{
                                        fontSize: 12,
                                        color: 'var(--color-text-muted)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Drawer links */}
                        <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
                            <DrawerLink to="/" icon="🏠" label="Home" onClick={() => setMenuOpen(false)} />
                            {isAuthenticated ? (
                                <>
                                    <DrawerLink to="/account" icon="👤" label="My Account" onClick={() => setMenuOpen(false)} />
                                    <DrawerLink to="/create-post" icon="➕" label="Create a Post" onClick={() => setMenuOpen(false)} />
                                    <DrawerLink to="/settings" icon="⚙️" label="Settings" onClick={() => setMenuOpen(false)} />
                                </>
                            ) : (
                                <>
                                    <DrawerLink to="/login" icon="🔑" label="Log In" onClick={() => setMenuOpen(false)} />
                                    <DrawerLink to="/signup" icon="🚀" label="Sign Up" onClick={() => setMenuOpen(false)} />
                                </>
                            )}
                        </div>

                        {/* Logout button at bottom of drawer if authenticated */}
                        {isAuthenticated && (
                            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        padding: '10px 16px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: 10,
                                        color: '#ef4444',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                    }}
                                >
                                     Logout
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Page content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>

            {/* Footer */}
            {!isAuthPage && (
                <footer
                    style={{
                        background: 'var(--color-surface)',
                        borderTop: '1px solid var(--color-border)',
                        padding: isMobile ? '16px 14px' : '20px',
                        textAlign: 'center',
                    }}
                >
                    <p
                        style={{
                            fontSize: 12,
                            color: 'var(--color-text-muted)',
                            margin: 0,
                        }}
                    >
                        © {new Date().getFullYear()} Food Recipe. All rights reserved.
                    </p>
                </footer>
            )}
        </div>
    );
}

function DrawerLink({ to, icon, label, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '13px 20px',
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
                transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
        </Link>
    );
}

export default App;

