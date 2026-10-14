import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import { deleteRecipePost } from '../api/recipeApi';
import EditRecipeModal from '../components/EditRecipeModal';
import useWindowWidth from '../hooks/useWindowWidth';
import bannerImg from '../assets/profile-banner.jpg'; // Ensure your chosen image is saved here

function Account() {
    const { user, updateProfile, accessToken, token } = useAuth();
    const authToken = accessToken || token;
    const { isMobile } = useWindowWidth();
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [activeTab, setActiveTab] = useState('my-posts');

    const [myPosts, setMyPosts] = useState([]);
    const [myPostsLoading, setMyPostsLoading] = useState(true);
    const [myPostsError, setMyPostsError] = useState('');

    const [editingPost, setEditingPost] = useState(null);
    const [deletingPost, setDeletingPost] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionFeedback, setActionFeedback] = useState('');

    useEffect(() => {
        if (deletingPost) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [deletingPost]);

    const [commentedPosts, setCommentedPosts] = useState([]);
    const [commentedLoading, setCommentedLoading] = useState(true);
    const [commentedError, setCommentedError] = useState('');

    const [prevUser, setPrevUser] = useState(null);

    if (user !== prevUser) {
        setPrevUser(user);
        if (user?.name !== undefined) {
            setName(user.name || '');
        }
    }

    const fetchMyPosts = () => {
        api.get('/my-posts')
            .then((res) => setMyPosts(res.data.recipes || []))
            .catch(() => setMyPostsError('Failed to load your published posts.'))
            .finally(() => setMyPostsLoading(false));
    };

    const fetchCommentedPosts = () => {
        api.get('/commented-posts')
            .then((res) => setCommentedPosts(res.data.recipes || []))
            .catch(() => setCommentedError('Failed to load commented posts.'))
            .finally(() => setCommentedLoading(false));
    };

    useEffect(() => {
        fetchMyPosts();
        fetchCommentedPosts();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError('');
        setSaveSuccess(false);

        try {
            await updateProfile(name);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            setSaveError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingPost) return;
        setIsDeleting(true);
        try {
            await deleteRecipePost(deletingPost._id, authToken);
            setMyPosts((prev) => prev.filter((p) => p._id !== deletingPost._id));
            setActionFeedback(`✓ Post "${deletingPost.title}" deleted successfully.`);
            setTimeout(() => setActionFeedback(''), 4000);
            setDeletingPost(null);
        } catch (err) {
            console.error('Delete post error:', err);
            alert(err.response?.data?.message || 'Failed to delete recipe post.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRecipeUpdated = (updated) => {
        setMyPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        setActionFeedback(`✓ Post "${updated.title}" updated successfully.`);
        setTimeout(() => setActionFeedback(''), 4000);
    };

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
            </div>

            {/* Main Content Overlapping Banner */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10">
                
                {/* Profile Card */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-10 shadow-xl mb-12 transition-colors relative">
                    
                    {/* Floating Avatar */}
                    <div className="absolute -top-12 left-6 md:left-10 w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-3xl font-bold shadow-lg transition-colors">
                        {(user?.name || user?.username || '?').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="mt-14 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white transition-colors">
                                {user?.name || 'Chef'}
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-medium tracking-wide">
                                @{user?.username || 'username'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        {saveSuccess && (
                            <div className="p-3.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium border border-green-200 dark:border-green-800 transition-colors">
                                ✓ Profile name updated successfully!
                            </div>
                        )}

                        {saveError && (
                            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-800 transition-colors">
                                ⚠️ {saveError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Editable Field */}
                            <div>
                                <label htmlFor="account-name-input" className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 dark:text-neutral-300 mb-2 transition-colors">
                                    Display Name
                                </label>
                                <input
                                    id="account-name-input"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                                />
                            </div>

                            {/* Username (Readonly) */}
                            <div>
                                <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-500 dark:text-neutral-500 mb-2 transition-colors">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={user?.username || ''}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 dark:text-neutral-500 cursor-not-allowed transition-colors"
                                />
                            </div>
                        </div>

                        {/* Email (Readonly) */}
                        <div>
                            <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-500 dark:text-neutral-500 mb-2 transition-colors">
                                Email Address
                            </label>
                            <input
                                type="email"
                                readOnly
                                value={user?.email || ''}
                                className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-400 dark:text-neutral-500 cursor-not-allowed transition-colors"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                id="save-profile-btn"
                                type="submit"
                                disabled={saving}
                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-200 dark:border-neutral-800 mb-8 transition-colors">
                    <div className="flex gap-8 overflow-x-auto scrollbar-none">
                        <button
                            id="tab-my-posts"
                            onClick={() => setActiveTab('my-posts')}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap ${
                                activeTab === 'my-posts' 
                                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' 
                                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                        >
                            <span>My Posts</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                activeTab === 'my-posts' 
                                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' 
                                    : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500'
                            }`}>
                                {myPosts.length}
                            </span>
                        </button>

                        <button
                            id="tab-commented-posts"
                            onClick={() => setActiveTab('commented-posts')}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap ${
                                activeTab === 'commented-posts' 
                                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white' 
                                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                        >
                            <span>Commented Posts</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                activeTab === 'commented-posts' 
                                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' 
                                    : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500'
                            }`}>
                                {commentedPosts.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* TAB CONTENT: MY POSTS */}
                {activeTab === 'my-posts' && (
                    <div className="animate-fade-in">
                        {actionFeedback && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold border border-green-200 dark:border-green-800 mb-6 transition-colors">
                                {actionFeedback}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 m-0 transition-colors">
                                Recipes authored and published by you.
                            </p>
                            <Link
                                to="/create-post"
                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0"
                            >
                                + Create New Post
                            </Link>
                        </div>

                        {myPostsLoading ? (
                            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 font-serif italic transition-colors">
                                Loading your recipes...
                            </div>
                        ) : myPostsError ? (
                            <div className="text-red-600 dark:text-red-400 p-4 transition-colors">{myPostsError}</div>
                        ) : myPosts.length === 0 ? (
                            <div className="text-center py-20 px-6 bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl transition-colors">
                                <span className="text-5xl block mb-4">👨‍🍳</span>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
                                    You haven't created any posts yet
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 transition-colors">
                                    Share your first delicious recipe with the community!
                                </p>
                                <Link
                                    to="/create-post"
                                    className="inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                                >
                                    Create Your First Post
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myPosts.map((post) => (
                                    <RecipePostCard
                                        key={post._id}
                                        post={post}
                                        isOwnPost={true}
                                        onEdit={() => setEditingPost(post)}
                                        onDelete={() => setDeletingPost(post)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB CONTENT: COMMENTED POSTS */}
                {activeTab === 'commented-posts' && (
                    <div className="animate-fade-in">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 transition-colors">
                            Recipes where you have joined the discussion.
                        </p>

                        {commentedLoading ? (
                            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 font-serif italic transition-colors">
                                Loading commented recipes...
                            </div>
                        ) : commentedError ? (
                            <div className="text-red-600 dark:text-red-400 p-4 transition-colors">{commentedError}</div>
                        ) : commentedPosts.length === 0 ? (
                            <div className="text-center py-20 px-6 bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl transition-colors">
                                <span className="text-5xl block mb-4">💬</span>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
                                    No commented recipes found
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 transition-colors">
                                    Explore recipes on the home feed and leave a comment to save them here!
                                </p>
                                <Link
                                    to="/"
                                    className="inline-block bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    Explore Recipe Feed
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {commentedPosts.map((post) => (
                                    <RecipePostCard key={post._id} post={post} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Recipe Modal */}
            <EditRecipeModal
                isOpen={!!editingPost}
                recipe={editingPost}
                onClose={() => setEditingPost(null)}
                onRecipeUpdated={handleRecipeUpdated}
            />

            {/* Delete Confirmation Modal (Now completely Tailwind & Dark Mode supported) */}
            {deletingPost && (
                <div 
                    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity"
                    onClick={() => !isDeleting && setDeletingPost(null)}
                >
                    <div 
                        className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-2xl w-full max-w-md p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center text-2xl shrink-0 transition-colors">
                                🗑️
                            </div>
                            <div>
                                <h3 className="text-lg font-bold m-0 transition-colors">Delete Recipe Post?</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 m-0 mt-1 transition-colors">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed m-0 transition-colors">
                            Are you sure you want to permanently delete <strong>"{deletingPost.title}"</strong> and all of its comments?
                        </p>

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeletingPost(null)}
                                className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="px-5 py-2.5 rounded-lg border-none bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RecipePostCard({ post, isOwnPost, onEdit, onDelete }) {
    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col group">
            <Link to={`/recipe/${post.slug}`} className="flex flex-col flex-1">
                <div className="h-48 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative transition-colors">
                    <img
                        src={post.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.category && (
                        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded-md">
                            {post.category}
                        </span>
                    )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                    <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-snug transition-colors">
                        {post.title}
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2 flex-1 transition-colors">
                        {post.description}
                    </p>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex justify-between uppercase tracking-wider font-semibold transition-colors">
                        <span>By {post.authorName || 'Chef'}</span>
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                </div>
            </Link>

            {isOwnPost && (
                <div className="flex gap-2 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 justify-end transition-colors">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onEdit) onEdit(post);
                        }}
                        className="px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onDelete) onDelete(post);
                        }}
                        className="px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-500/20 transition-colors"
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default Account;