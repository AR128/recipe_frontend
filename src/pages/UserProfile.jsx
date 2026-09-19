import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { getPublicUserProfile } from '../api/recipeApi';
import RecipeCard from '../components/RecipeCard';
import useWindowWidth from '../hooks/useWindowWidth';

function getInitials(user) {
    if (!user) return '?';
    const name = user.name || user.username || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '?';
}

function UserProfile() {
    const { username } = useParams();
    const { isMobile } = useWindowWidth();
    const [userData, setUserData] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [prevUsername, setPrevUsername] = useState(null);

    if (username && username !== prevUsername) {
        setPrevUsername(username);
        setLoading(true);
        setError('');
    }

    useEffect(() => {
        if (!username) return;
        let isMounted = true;

        getPublicUserProfile(username)
            .then((data) => {
                if (isMounted) {
                    setUserData(data.user);
                    setRecipes(data.recipes || []);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load user profile:', err);
                    setError(err.response?.data?.message || 'Chef / User not found.');
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [username]);

    if (loading) {
        return (
            <div style={{ maxWidth: 1000, margin: '60px auto', textAlign: 'center', padding: 20 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: '3px solid var(--color-border)',
                        borderTopColor: 'var(--color-accent)',
                        margin: '0 auto 16px',
                        animation: 'spin 1s linear infinite',
                    }}
                />
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading foodie profile...</p>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '40px 20px' }}>
                <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>👨‍🍳</span>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
                    User Not Found
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '0 0 20px' }}>
                    {error || 'The chef profile you are looking for does not exist.'}
                </p>
                <Link
                    to="/"
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        background: 'var(--color-accent)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 14,
                    }}
                >
                    Back to Feed
                </Link>
            </div>
        );
    }

    const initials = getInitials(userData);

    return (
        <div style={{ maxWidth: 1000, margin: '28px auto', padding: isMobile ? '0 14px 48px' : '0 20px 60px' }}>
            {/* Back link */}
            <Link
                to="/"
                style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 20,
                }}
            >
                ← Back to Feed
            </Link>

            {/* Profile Header Card */}
            <div
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 20,
                    padding: '28px 32px',
                    marginBottom: 36,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'var(--color-accent)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                    <h1
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 26,
                            fontWeight: 700,
                            margin: '0 0 4px',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {userData.name || userData.username}
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-accent)', fontWeight: 600, margin: '0 0 8px' }}>
                        @{userData.username}
                    </p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
                        <span>📅 Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}</span>
                        <span>🍲 {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} Published</span>
                    </div>
                </div>
            </div>

            {/* Recipes Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 22,
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        Published Recipes ({recipes.length})
                    </h2>
                </div>

                {recipes.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '48px 20px',
                            background: 'var(--color-surface)',
                            border: '1px border-dashed var(--color-border)',
                            borderRadius: 16,
                        }}
                    >
                        <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>🍳</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                            No published recipes yet
                        </h3>
                        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                            {userData.name || userData.username} has not posted any recipes so far.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, 260px), 1fr))`, gap: isMobile ? 14 : 24 }}>
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;
