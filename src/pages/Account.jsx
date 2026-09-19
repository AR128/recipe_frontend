import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import { deleteRecipePost } from '../api/recipeApi';
import EditRecipeModal from '../components/EditRecipeModal';
import useWindowWidth from '../hooks/useWindowWidth';

function Account() {
    const { user, updateProfile, accessToken, token } = useAuth();
    const authToken = accessToken || token;
    const { isMobile } = useWindowWidth();
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Active tab: 'my-posts' | 'commented-posts'
    const [activeTab, setActiveTab] = useState('my-posts');

    // My Posts state
    const [myPosts, setMyPosts] = useState([]);
    const [myPostsLoading, setMyPostsLoading] = useState(true);
    const [myPostsError, setMyPostsError] = useState('');

    // Edit / Delete post states
    const [editingPost, setEditingPost] = useState(null);
    const [deletingPost, setDeletingPost] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionFeedback, setActionFeedback] = useState('');

    // Lock body scroll when delete confirmation popup is open
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

    // Commented Posts state
    const [commentedPosts, setCommentedPosts] = useState([]);
    const [commentedLoading, setCommentedLoading] = useState(true);
    const [commentedError, setCommentedError] = useState('');

    const [prevUser, setPrevUser] = useState(null);

    // Synchronize name when user changes (during render to avoid cascading useEffect renders)
    if (user !== prevUser) {
        setPrevUser(user);
        if (user?.name !== undefined) {
            setName(user.name || '');
        }
    }

    // Fetch My Posts
    const fetchMyPosts = () => {
        api.get('/my-posts')
            .then((res) => setMyPosts(res.data.recipes || []))
            .catch(() => setMyPostsError('Failed to load your published posts.'))
            .finally(() => setMyPostsLoading(false));
    };

    // Fetch Commented Posts
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
        <div style={{ maxWidth: 960, margin: '28px auto', padding: isMobile ? '0 14px 48px' : '0 20px 60px' }}>
            {/* Account Title */}
            <div style={{ marginBottom: 28 }}>
                <h1
                    style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: isMobile ? 24 : 32,
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--color-text-primary)',
                    }}
                >
                    My Account
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4, margin: 0 }}>
                    Manage your personal profile and view your culinary posts.
                </p>
            </div>

            {/* Profile Info Card */}
            <div
                style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 36,
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text-primary)' }}>
                    Profile Details
                </h2>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {saveSuccess && (
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 8,
                                background: 'var(--color-success-bg)',
                                color: 'var(--color-success)',
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            ✓ Profile name updated successfully!
                        </div>
                    )}

                    {saveError && (
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 8,
                                background: 'var(--color-accent-soft)',
                                color: 'var(--color-accent)',
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            ⚠️ {saveError}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                        {/* Display Name */}
                        <div>
                            <label
                                htmlFor="account-name-input"
                                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                            >
                                Display Name
                            </label>
                            <input
                                id="account-name-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 14,
                                }}
                            />
                        </div>

                        {/* Username (Readonly) */}
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Username
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={user?.username || ''}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface-2)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 14,
                                    cursor: 'not-allowed',
                                }}
                            />
                        </div>
                    </div>

                    {/* Email (Readonly) */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            readOnly
                            value={user?.email || ''}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text-muted)',
                                fontSize: 14,
                                cursor: 'not-allowed',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                        <button
                            id="save-profile-btn"
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '9px 20px',
                                borderRadius: 8,
                                border: 'none',
                                background: 'var(--color-accent)',
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Sections Header with Tabs */}
            <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 24 }}>
                    <button
                        id="tab-my-posts"
                        onClick={() => setActiveTab('my-posts')}
                        style={{
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'my-posts' ? '2px solid var(--color-accent)' : '2px solid transparent',
                            color: activeTab === 'my-posts' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'color 0.15s ease',
                        }}
                    >
                        <span>My Posts</span>
                        <span
                            style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 10,
                                background: activeTab === 'my-posts' ? 'var(--color-accent-soft)' : 'var(--color-surface-2)',
                                color: activeTab === 'my-posts' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            }}
                        >
                            {myPosts.length}
                        </span>
                    </button>

                    <button
                        id="tab-commented-posts"
                        onClick={() => setActiveTab('commented-posts')}
                        style={{
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'commented-posts' ? '2px solid var(--color-accent)' : '2px solid transparent',
                            color: activeTab === 'commented-posts' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'color 0.15s ease',
                        }}
                    >
                        <span>Commented Posts</span>
                        <span
                            style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 10,
                                background: activeTab === 'commented-posts' ? 'var(--color-accent-soft)' : 'var(--color-surface-2)',
                                color: activeTab === 'commented-posts' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            }}
                        >
                            {commentedPosts.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: MY POSTS */}
            {activeTab === 'my-posts' && (
                <div>
                    {actionFeedback && (
                        <div
                            style={{
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: 'rgba(34, 197, 94, 0.12)',
                                border: '1px solid #86efac',
                                color: 'var(--color-success, #16a34a)',
                                fontSize: 14,
                                fontWeight: 600,
                                marginBottom: 20,
                            }}
                        >
                            {actionFeedback}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                            Recipes authored and published by you.
                        </p>
                        <Link
                            to="/create-post"
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: 'var(--color-accent)',
                                color: '#fff',
                                textDecoration: 'none',
                                fontSize: 13,
                                fontWeight: 600,
                            }}
                        >
                            + Create New Post
                        </Link>
                    </div>

                    {myPostsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                            Loading your recipes...
                        </div>
                    ) : myPostsError ? (
                        <div style={{ color: 'var(--color-accent)', padding: 16 }}>{myPostsError}</div>
                    ) : myPosts.length === 0 ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                background: 'var(--color-surface)',
                                border: '1px border-dashed var(--color-border)',
                                borderRadius: 16,
                            }}
                        >
                            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>👨‍🍳</span>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                                You haven't created any posts yet
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
                                Share your first delicious recipe with the community!
                            </p>
                            <Link
                                to="/create-post"
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    background: 'var(--color-accent)',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                Create Your First Post
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: isMobile ? 14 : 20 }}>
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
                <div>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
                        Recipes where you have joined the discussion.
                    </p>

                    {commentedLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                            Loading commented recipes...
                        </div>
                    ) : commentedError ? (
                        <div style={{ color: 'var(--color-accent)', padding: 16 }}>{commentedError}</div>
                    ) : commentedPosts.length === 0 ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '48px 20px',
                                background: 'var(--color-surface)',
                                border: '1px border-dashed var(--color-border)',
                                borderRadius: 16,
                            }}
                        >
                            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>💬</span>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                                No commented recipes found
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
                                Explore recipes on the home feed and leave a comment to save them here!
                            </p>
                            <Link
                                to="/"
                                style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    background: 'var(--color-surface-2)',
                                    color: 'var(--color-text-primary)',
                                    textDecoration: 'none',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    border: '1px solid var(--color-border)',
                                }}
                            >
                                Explore Recipe Feed
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: isMobile ? 14 : 20 }}>
                            {commentedPosts.map((post) => (
                                <RecipePostCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Edit Recipe Modal */}
            <EditRecipeModal
                isOpen={!!editingPost}
                recipe={editingPost}
                onClose={() => setEditingPost(null)}
                onRecipeUpdated={handleRecipeUpdated}
            />

            {/* Delete Confirmation Modal */}
            {deletingPost && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                    }}
                    onClick={() => !isDeleting && setDeletingPost(null)}
                >
                    <div
                        style={{
                            background: 'var(--color-surface, #1e293b)',
                            color: 'var(--color-text-primary, #fff)',
                            borderRadius: 16,
                            width: '100%',
                            maxWidth: 440,
                            padding: 24,
                            border: '1px solid var(--color-border, #334155)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22,
                                    flexShrink: 0,
                                }}
                            >
                                🗑️
                            </div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                                    Delete Recipe Post?
                                </h3>
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <p style={{ fontSize: 14, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.5 }}>
                            Are you sure you want to permanently delete <strong>"{deletingPost.title}"</strong> and all of its comments?
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeletingPost(null)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 8,
                                    border: '1px solid var(--color-border)',
                                    background: 'transparent',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: '#dc2626',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    opacity: isDeleting ? 0.7 : 1,
                                }}
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
        <div
            style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <Link
                to={`/recipe/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}
            >
                <div style={{ height: 160, width: '100%', background: '#f0f0f0', overflow: 'hidden', position: 'relative' }}>
                    <img
                        src={post.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {post.category && (
                        <span
                            style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                background: 'rgba(0, 0, 0, 0.65)',
                                backdropFilter: 'blur(4px)',
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: 6,
                            }}
                        >
                            {post.category}
                        </span>
                    )}
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4
                        style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 16,
                            fontWeight: 700,
                            margin: '0 0 6px',
                            color: 'var(--color-text-primary)',
                            lineHeight: 1.3,
                        }}
                    >
                        {post.title}
                    </h4>
                    <p
                        style={{
                            fontSize: 12,
                            color: 'var(--color-text-secondary)',
                            margin: '0 0 12px',
                            lineClamp: 2,
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            display: '-webkit-box',
                            overflow: 'hidden',
                            flex: 1,
                        }}
                    >
                        {post.description}
                    </p>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>By {post.authorName || 'Chef'}</span>
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                </div>
            </Link>

            {/* Own post action bar */}
            {isOwnPost && (
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        padding: '10px 16px',
                        borderTop: '1px solid var(--color-border)',
                        background: 'var(--color-surface-2, rgba(0,0,0,0.03))',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onEdit) onEdit(post);
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
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
                        style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default Account;
