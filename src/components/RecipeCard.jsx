import { Link } from 'react-router';

function RecipeCard({ recipe }) {
    const {
        slug,
        title,
        description,
        image,
        authorName,
        category,
        cookTime,
        prepTime,
        createdAt,
    } = recipe;

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : '';

    const totalTime = (() => {
        const parts = [prepTime, cookTime].filter(Boolean);
        return parts.length > 0 ? parts.join(' + ') : '';
    })();

    return (
        <Link
            to={`/recipe/${slug}`}
            style={{ textDecoration: 'none', display: 'block' }}
        >

            <article
                style={{
                    background: 'var(--color-surface)',
                    borderRadius: 18,
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
            >
                {/* Image */}
                <div
                    style={{
                        position: 'relative',
                        height: 210,
                        overflow: 'hidden',
                        background: 'var(--color-surface-2)',
                        flexShrink: 0,
                    }}
                >
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.4s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 48,
                            }}
                        >
                            🍽️
                        </div>
                    )}

                    {/* Category badge */}
                    {category && (
                        <span
                            style={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                background: 'rgba(255,255,255,0.92)',
                                backdropFilter: 'blur(6px)',
                                color: '#1a1a18',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                                padding: '4px 10px',
                                borderRadius: 20,
                            }}
                        >
                            {category}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: '20px 20px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        flex: 1,
                    }}
                >
                    <h3
                        className="font-display"
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            margin: 0,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {title}
                    </h3>

                    <p
                        style={{
                            fontSize: 13,
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1,
                        }}
                    >
                        {description}
                    </p>

                    {/* Meta row */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid var(--color-border)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12,
                                color: 'var(--color-text-secondary)',
                                fontWeight: 500,
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {authorName || 'Chef'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {totalTime && (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: 12,
                                        color: 'var(--color-text-secondary)',
                                        fontWeight: 500,
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {totalTime}
                                </span>
                            )}
                            {formattedDate && (
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--color-text-muted)',
                                    }}
                                >
                                    {formattedDate}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default RecipeCard;
