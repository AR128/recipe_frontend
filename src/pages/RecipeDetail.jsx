import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { getRecipe } from '../api/recipeApi';
import CommentSection from '../components/CommentSection';
import useWindowWidth from '../hooks/useWindowWidth';

function RecipeDetail() {
    const { slug } = useParams();
    const { isMobile } = useWindowWidth();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [prevSlug, setPrevSlug] = useState(null);

    if (slug && slug !== prevSlug) {
        setPrevSlug(slug);
        setLoading(true);
        setError('');
    }

    useEffect(() => {
        if (!slug) return;
        let isMounted = true;

        getRecipe(slug)
            .then((data) => {
                if (isMounted) setRecipe(data.recipe);
            })
            .catch((err) => {
                if (!isMounted) return;
                if (err.response?.status === 404) {
                    setError('Recipe not found.');
                } else {
                    setError('Failed to load recipe. Please try again.');
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const formattedDate = recipe?.createdAt
        ? new Date(recipe.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';

    const containerStyle = {
        maxWidth: 820,
        margin: '0 auto',
        padding: isMobile ? '28px 14px 60px' : '48px 20px 80px',
    };

    const metaChipStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 20,
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
    };

    // Loading skeleton
    if (loading) {
        return (
            <div style={containerStyle}>
                <div className="skeleton" style={{ height: 14, width: 100, marginBottom: 32 }} />
                <div className="skeleton" style={{ height: 44, width: '80%', marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 44, width: '55%', marginBottom: 24 }} />
                <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
                    {[100, 80, 90].map((w, i) => (
                        <div key={i} className="skeleton" style={{ height: 32, width: w, borderRadius: 20 }} />
                    ))}
                </div>
                <div className="skeleton" style={{ height: 420, borderRadius: 18, marginBottom: 36 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: 14, width: `${95 - i * 10}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ ...containerStyle, textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>😕</div>
                <h2
                    className="font-display"
                    style={{ fontSize: 26, color: 'var(--color-text-primary)', marginBottom: 10 }}
                >
                    {error === 'Recipe not found.' ? 'Recipe Not Found' : 'Something Went Wrong'}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>{error}</p>
                <Link
                    to="/"
                    style={{
                        background: 'var(--color-accent)',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    ← Back to Feed
                </Link>
            </div>
        );
    }

    if (!recipe) return null;

    return (
        <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
            {/* Hero image */}
            {recipe.image && (
                <div
                    style={{
                        width: '100%',
                        maxHeight: 480,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <img
                        src={recipe.image}
                        alt={recipe.title}
                        style={{
                            width: '100%',
                            height: isMobile ? 240 : 480,
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)',
                        }}
                    />
                </div>
            )}

            <div style={containerStyle} className="animate-fade-in">
                {/* Back link */}
                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 500,
                        marginBottom: 28,
                        transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    All Recipes
                </Link>

                {/* Category */}
                {recipe.category && (
                    <span
                        style={{
                            display: 'inline-block',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-accent)',
                            background: 'var(--color-accent-soft)',
                            padding: '4px 12px',
                            borderRadius: 20,
                            marginBottom: 16,
                        }}
                    >
                        {recipe.category}
                    </span>
                )}

                {/* Title */}
                <h1
                    className="font-display"
                    style={{
                        fontSize: 'clamp(22px, 4vw, 40px)',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.2,
                        margin: '0 0 14px',
                    }}
                >
                    {recipe.title}
                </h1>

                {/* Description */}
                <p
                    style={{
                        fontSize: 17,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.7,
                        margin: '0 0 24px',
                        fontStyle: 'italic',
                    }}
                >
                    {recipe.description}
                </p>

                {/* Meta chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
                    {recipe.author?.username ? (
                        <Link
                            to={`/user/${recipe.author.username}`}
                            style={{
                                ...metaChipStyle,
                                textDecoration: 'none',
                                color: 'var(--color-accent)',
                                fontWeight: 600,
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            By {recipe.authorName || recipe.author.username}
                        </Link>
                    ) : (
                        <span style={metaChipStyle}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            By {recipe.authorName || 'Chef'}
                        </span>
                    )}
                    {recipe.prepTime && (
                        <span style={metaChipStyle}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Prep: {recipe.prepTime}
                        </span>
                    )}
                    {recipe.cookTime && (
                        <span style={metaChipStyle}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                            </svg>
                            Cook: {recipe.cookTime}
                        </span>
                    )}
                    {recipe.servings && (
                        <span style={metaChipStyle}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Serves {recipe.servings}
                        </span>
                    )}
                    {formattedDate && (
                        <span style={{ ...metaChipStyle, marginLeft: 'auto' }}>
                            {formattedDate}
                        </span>
                    )}
                </div>

                {/* Main content prose */}
                {recipe.content && (
                    <div
                        style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 14,
                            padding: '24px 28px',
                            marginBottom: 36,
                            fontSize: 15,
                            lineHeight: 1.8,
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{recipe.content}</p>
                    </div>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                        gap: isMobile ? 16 : 28,
                        marginBottom: 40,
                    }}
                >
                    {/* Ingredients */}
                    {recipe.ingredients?.length > 0 && (
                        <div
                            style={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 14,
                                padding: '24px 24px',
                            }}
                        >
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 18px',
                                }}
                            >
                                Ingredients
                            </h2>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {recipe.ingredients.map((ing, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 10,
                                            fontSize: 14,
                                            color: 'var(--color-text-secondary)',
                                            paddingBottom: 10,
                                            borderBottom: i < recipe.ingredients.length - 1
                                                ? '1px solid var(--color-border)'
                                                : 'none',
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: 'var(--color-accent)',
                                                flexShrink: 0,
                                                marginTop: 6,
                                            }}
                                        />
                                        <span>
                                            {ing.amount && (
                                                <strong style={{ color: 'var(--color-text-primary)', marginRight: 5 }}>
                                                    {ing.amount}
                                                </strong>
                                            )}
                                            {ing.item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tags */}
                    {recipe.tags?.length > 0 && (
                        <div
                            style={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 14,
                                padding: '24px 24px',
                                alignSelf: 'start',
                            }}
                        >
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    margin: '0 0 16px',
                                }}
                            >
                                Tags
                            </h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {recipe.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            background: 'var(--color-accent-soft)',
                                            color: 'var(--color-accent)',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            padding: '4px 12px',
                                            borderRadius: 20,
                                        }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Steps */}
                {recipe.steps?.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <h2
                            className="font-display"
                            style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                margin: '0 0 22px',
                            }}
                        >
                            Instructions
                        </h2>
                        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {recipe.steps.map((step, i) => (
                                <li
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: 18,
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 14,
                                        padding: '18px 20px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'var(--color-accent)',
                                            color: '#fff',
                                            fontSize: 13,
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 15,
                                            color: 'var(--color-text-secondary)',
                                            lineHeight: 1.7,
                                            paddingTop: 4,
                                        }}
                                    >
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Comments */}
                <CommentSection slug={slug} />
            </div>
        </div>
    );
}

export default RecipeDetail;
