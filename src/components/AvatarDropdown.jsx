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
        <div ref={ref} className="relative">
            {/* Avatar button */}
            <button
                id="avatar-menu-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close user menu' : 'Open user menu'}
                aria-expanded={open}
                aria-controls="avatar-dropdown"
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-150 font-sans font-bold text-sm
                    ${open 
                        ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black border-neutral-800 dark:border-neutral-200 shadow-lg scale-105 ring-4 ring-neutral-900/10 dark:ring-white/10' 
                        : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm hover:scale-105 hover:shadow-md'
                    }`}
            >
                {initials}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    id="avatar-dropdown"
                    aria-labelledby="avatar-menu-btn"
                    className="absolute top-[calc(100%+14px)] right-0 w-[min(18rem,calc(100vw-2rem))] bg-white dark:bg-[#151515] border border-neutral-200/80 dark:border-white/10 rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-fade-in transition-colors duration-200"
                >
                    
                    {/* User info header */}
                    <div className="px-4 py-4 border-b border-neutral-200/80 dark:border-white/10 transition-colors">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 mb-1">
                            Signed in as
                        </div>
                        <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate transition-colors">
                            {user?.name || user?.username}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1 transition-colors">
                            {user?.email}
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
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
                    <div className="p-2 border-t border-neutral-200/80 dark:border-white/10 transition-colors">
                        <button
                            id="dropdown-logout"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
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
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.07] hover:text-neutral-950 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/60"
        >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-white dark:bg-white/[0.06] dark:text-neutral-400 dark:group-hover:bg-white/10">
                {icon}
            </span>
            {label}
        </Link>
    );
}

export default AvatarDropdown;