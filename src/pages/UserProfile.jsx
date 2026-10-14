import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { getPublicUserProfile } from '../api/recipeApi';
import RecipeCard from '../components/RecipeCard';
import bannerImg from '../assets/profile-banner.jpg'; // We reuse the gorgeous banner here!

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
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors">
                <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400 font-serif italic transition-colors">
                    Loading foodie profile...
                </p>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] px-6 transition-colors text-center">
                <span className="text-6xl block mb-6 drop-shadow-sm">👨‍🍳</span>
                <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-3 transition-colors">
                    User Not Found
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm transition-colors">
                    {error || 'The chef profile you are looking for does not exist or has been removed.'}
                </p>
                <Link
                    to="/"
                    className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                    Back to Feed
                </Link>
            </div>
        );
    }

    const initials = getInitials(userData);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors pb-20">
            
            {/* Cinematic Banner */}
            <div className="w-full h-64 md:h-80 relative">
                <img 
                    src={bannerImg} 
                    alt="Chef Profile Cover" 
                    className="w-full h-full object-cover brightness-75 dark:brightness-50 transition-all"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Back link floating on banner */}
                <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
                    <Link
                        to="/"
                        className="text-white hover:text-neutral-200 text-sm font-semibold flex items-center gap-2 transition-colors drop-shadow-md"
                    >
                        ← Back to Feed
                    </Link>
                </div>
            </div>

            {/* Main Content Overlapping Banner */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10 animate-fade-in">
                
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-10 shadow-xl mb-12 transition-colors relative flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
                    
                    {/* Floating Avatar */}
                    <div 
                        className="absolute -top-12 left-6 md:left-10 w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center text-3xl font-bold shadow-lg text-white transition-colors"
                        style={{ background: `hsl(${(userData.username?.charCodeAt(0) * 31) % 360}, 55%, 55%)` }}
                    >
                        {initials}
                    </div>

                    {/* Content (pushed right on desktop to avoid avatar) */}
                    <div className="mt-14 md:mt-0 md:ml-[110px] flex-1">
                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white transition-colors mb-1">
                            {userData.name || userData.username}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium tracking-wide mb-4">
                            @{userData.username}
                        </p>
                        <div className="flex flex-wrap gap-4 md:gap-6 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                            <span className="flex items-center gap-1.5">
                                📅 Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                🍲 {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} Published
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recipes Section */}
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white transition-colors">
                            Published Recipes
                            <span className="font-sans text-sm font-medium text-neutral-500 dark:text-neutral-400 ml-3 align-middle">
                                ({recipes.length})
                            </span>
                        </h2>
                    </div>

                    {recipes.length === 0 ? (
                        <div className="text-center py-20 px-6 bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl transition-colors">
                            <span className="text-5xl block mb-4">🍳</span>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
                                No published recipes yet
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 transition-colors">
                                {userData.name || userData.username} has not posted any recipes so far.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map((recipe) => (
                                <RecipeCard key={recipe._id} recipe={recipe} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;