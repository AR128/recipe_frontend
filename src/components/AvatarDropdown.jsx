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
                aria-label="Open user menu"
                aria-expanded={open}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-150 font-sans font-bold text-sm
                    ${open 
                        ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black border-neutral-800 dark:border-neutral-200 shadow-md scale-105' 
                        : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm hover:scale-105'
                    }`}
            >
                {initials}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-[calc(100%+10px)] right-0 min-w-[210px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in transition-colors duration-200">
                    
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
                        <div className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate transition-colors">
                            {user?.name || user?.username}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 transition-colors">
                            {user?.email}
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
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
                    <div className="py-1.5 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
                        <button
                            id="dropdown-logout"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors"
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
            className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
            <span className="text-neutral-500 dark:text-neutral-400">{icon}</span>
            {label}
        </Link>
    );
}

export default AvatarDropdown;