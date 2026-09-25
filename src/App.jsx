import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from './context/useAuth';
import AvatarDropdown from './components/AvatarDropdown';
import useWindowWidth from './hooks/useWindowWidth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
          {/* Navigation Component */}
            {!isAuthPage && <Navbar />}
            {/* Mobile Navigation Drawer */}
            {menuOpen && (
                <>
                    {/* Backdrop */}j
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
            {!isAuthPage && <Footer />}
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

