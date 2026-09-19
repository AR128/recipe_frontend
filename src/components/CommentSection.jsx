import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';
import { getComments, postComment } from '../api/recipeApi';

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function CommentSection({ slug }) {
    const { isAuthenticated, user, accessToken } = useAuth();
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentsError, setCommentsError] = useState('');
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [prevSlug, setPrevSlug] = useState(null);

    // Reset loading/error state during render when slug changes (avoids synchronous setState in useEffect)
    if (slug && slug !== prevSlug) {
        setPrevSlug(slug);
        setLoadingComments(true);
        setCommentsError('');
    }

    useEffect(() => {
        if (!slug) return;
        let isMounted = true;

        getComments(slug)
            .then((data) => {
                if (isMounted) setComments(data.comments || []);
            })
            .catch(() => {
                if (isMounted) setCommentsError('Failed to load comments.');
            })
            .finally(() => {
                if (isMounted) setLoadingComments(false);
            });

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!text.trim()) return;
        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess(false);
        try {
            const data = await postComment(slug, text.trim(), accessToken);
            setComments((prev) => [data.comment, ...prev]);
            setText('');
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err) {
            setSubmitError(
                err.response?.data?.message || 'Failed to post comment. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnauthClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    };

    const sectionStyle = {
        borderTop: '1px solid var(--color-border)',
        paddingTop: 36,
        marginTop: 36,
    };

    const headingStyle = {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: 24,
    };

    return (
        <section style={sectionStyle} id="comments">
            <h2 style={headingStyle}>
                Comments
                {comments.length > 0 && (
                    <span
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--color-text-muted)',
                            marginLeft: 10,
                        }}
                    >
                        ({comments.length})
                    </span>
                )}
            </h2>

            {/* Comment form */}
            {isAuthenticated ? (
                <form
                    onSubmit={handleSubmit}
                    style={{
                        background: 'var(--color-surface-2)',
                        borderRadius: 14,
                        padding: 20,
                        marginBottom: 32,
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'var(--color-accent)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {(user?.name || user?.username || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            {user?.name || user?.username}
                        </span>
                    </div>
                    <textarea
                        id="comment-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Share your thoughts on this recipe..."
                        rows={3}
                        maxLength={1000}
                        required
                        style={{
                            width: '100%',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 10,
                            padding: '10px 14px',
                            fontSize: 14,
                            color: 'var(--color-text-primary)',
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'border-color 0.15s ease',
                            fontFamily: "'Inter', sans-serif",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                    />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 10,
                            gap: 12,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                color: 'var(--color-text-muted)',
                            }}
                        >
                            {text.length}/1000
                        </span>
                        <button
                            id="submit-comment-btn"
                            type="submit"
                            disabled={submitting || !text.trim()}
                            style={{
                                background: submitting || !text.trim()
                                    ? 'var(--color-border)'
                                    : 'var(--color-accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '9px 22px',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            {submitting ? (
                                <>
                                    <span
                                        style={{
                                            width: 12,
                                            height: 12,
                                            border: '2px solid rgba(255,255,255,0.4)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                        }}
                                        className="animate-spin"
                                    />
                                    Posting...
                                </>
                            ) : (
                                'Post Comment'
                            )}
                        </button>
                    </div>
                    {submitError && (
                        <p
                            style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: 'var(--color-accent)',
                            }}
                        >
                            {submitError}
                        </p>
                    )}
                    {submitSuccess && (
                        <p
                            style={{
                                marginTop: 8,
                                fontSize: 12,
                                color: 'var(--color-success)',
                            }}
                        >
                            ✓ Comment posted successfully!
                        </p>
                    )}
                </form>
            ) : (
                /* Auth gate */
                <div
                    style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 14,
                        padding: '24px 24px',
                        marginBottom: 32,
                    }}
                >
                    <div style={{ marginBottom: 12 }}>
                        <textarea
                            onClick={handleUnauthClick}
                            onFocus={handleUnauthClick}
                            readOnly
                            placeholder="Leave a comment... (Click to Log In)"
                            rows={2}
                            style={{
                                width: '100%',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 10,
                                padding: '10px 14px',
                                fontSize: 14,
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                resize: 'none',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                            }}
                        >
                            Join the conversation — log in to leave a comment.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link
                                id="comment-login-link"
                                to="/login"
                                style={{
                                    background: 'var(--color-accent)',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    borderRadius: 8,
                                    padding: '8px 20px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-accent)')}
                            >
                                Log In
                            </Link>
                            <Link
                                id="comment-signup-link"
                                to="/signup"
                                style={{
                                    background: 'transparent',
                                    color: 'var(--color-text-primary)',
                                    textDecoration: 'none',
                                    borderRadius: 8,
                                    padding: '8px 20px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    border: '1px solid var(--color-border)',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            )}


            {/* Comment list */}
            {loadingComments ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[1, 2].map((i) => (
                        <div key={i} style={{ display: 'flex', gap: 12 }}>
                            <div
                                className="skeleton"
                                style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div className="skeleton" style={{ width: 120, height: 12 }} />
                                <div className="skeleton" style={{ width: '90%', height: 12 }} />
                                <div className="skeleton" style={{ width: '60%', height: 12 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : commentsError ? (
                <p style={{ color: 'var(--color-accent)', fontSize: 14 }}>{commentsError}</p>
            ) : comments.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                    <p style={{ fontSize: 14 }}>
                        No comments yet. Be the first to share your thoughts!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {comments.map((comment, idx) => (
                        <div
                            key={comment._id}
                            className="animate-fade-in"
                            style={{
                                display: 'flex',
                                gap: 14,
                                padding: '18px 0',
                                borderBottom:
                                    idx < comments.length - 1
                                        ? '1px solid var(--color-border)'
                                        : 'none',
                                animationDelay: `${idx * 0.05}s`,
                            }}
                        >
                            {/* Avatar */}
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    background: `hsl(${(comment.user?.username?.charCodeAt(0) * 31) % 360}, 55%, 55%)`,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {(
                                    comment.user?.name ||
                                    comment.user?.username ||
                                    '?'
                                )
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: 10,
                                        marginBottom: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 14,
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        {comment.user?.name || comment.user?.username || 'Anonymous'}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        fontSize: 14,
                                        color: 'var(--color-text-secondary)',
                                        lineHeight: 1.6,
                                        margin: 0,
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default CommentSection;
