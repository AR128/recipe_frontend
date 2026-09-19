import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/useAuth';
import { createRecipePost, uploadImage } from '../api/recipeApi';
import ImageUploadModal from '../components/ImageUploadModal';
import useWindowWidth from '../hooks/useWindowWidth';

const CATEGORIES = [
    'General',
    'Italian',
    'Seafood',
    'Mexican',
    'Beverages',
    'Desserts',
    'Breakfast',
    'Asian',
    'Vegetarian',
    'Quick & Easy',
];

// Shared input style factory
function inputStyle(extra = {}) {
    return {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        outline: 'none',
        transition: 'border-color 0.15s ease',
        ...extra,
    };
}

function CreatePost() {
    const { accessToken, token } = useAuth();
    const authToken = accessToken || token;
    const navigate = useNavigate();
    const { isMobile } = useWindowWidth();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState(4);
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');

    const [ingredients, setIngredients] = useState([
        { amount: '', item: '' },
    ]);

    const [steps, setSteps] = useState(['']);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ingredient list handlers
    const handleIngredientChange = (index, field, value) => {
        const next = [...ingredients];
        next[index][field] = value;
        setIngredients(next);
    };

    const addIngredient = () => {
        setIngredients((prev) => [...prev, { amount: '', item: '' }]);
    };

    const removeIngredient = (index) => {
        if (ingredients.length === 1) return;
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    // Step list handlers
    const handleStepChange = (index, value) => {
        const next = [...steps];
        next[index] = value;
        setSteps(next);
    };

    const addStep = () => {
        setSteps((prev) => [...prev, '']);
    };

    const removeStep = (index) => {
        if (steps.length === 1) return;
        setSteps((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Recipe Title is required.');
            return;
        }

        if (!description.trim()) {
            setError('Short Description is required.');
            return;
        }

        // Filter valid ingredients
        const validIngredients = ingredients.filter((ing) => ing.item.trim() !== '');

        // Filter valid steps
        const validSteps = steps.map((s) => s.trim()).filter(Boolean);

        setSubmitting(true);

        try {
            let finalImageUrl = image.trim();

            // If image is a base64 Data URL from the photo editor, upload to Cloudinary first
            if (finalImageUrl.startsWith('data:image/')) {
                try {
                    const uploadRes = await uploadImage(finalImageUrl, authToken);
                    if (uploadRes && uploadRes.url) {
                        finalImageUrl = uploadRes.url;
                    }
                } catch (uploadErr) {
                    console.error('Cloudinary upload failed:', uploadErr);
                    setError(
                        uploadErr.response?.data?.message ||
                        uploadErr.response?.data?.error ||
                        'Failed to upload image to Cloudinary. Please try again.'
                    );
                    setSubmitting(false);
                    return;
                }
            }

            const data = await createRecipePost(
                {
                    title: title.trim(),
                    category,
                    description: description.trim(),
                    image: finalImageUrl,
                    prepTime: prepTime.trim(),
                    cookTime: cookTime.trim(),
                    servings: Number(servings) || 4,
                    tags,
                    content: content.trim(),
                    ingredients: validIngredients,
                    steps: validSteps,
                },
                authToken
            );

            if (data.recipe && data.recipe.slug) {
                navigate(`/recipe/${data.recipe.slug}`);
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Failed to publish recipe post. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const cardStyle = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: isMobile ? '18px 16px' : 24,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
    };

    return (
        <div style={{ maxWidth: 860, margin: '28px auto', padding: isMobile ? '0 14px 48px' : '0 20px 60px' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
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
                        marginBottom: 12,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Feed
                </Link>
                <h1
                    style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: isMobile ? 24 : 32,
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--color-text-primary)',
                    }}
                >
                    Create a Food Recipe Post
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 6, margin: 0 }}>
                    Share your culinary creation with our global foodie community.
                </p>
            </div>

            {error && (
                <div
                    style={{
                        padding: '14px 18px',
                        borderRadius: 10,
                        background: 'var(--color-accent-soft)',
                        border: '1px solid #fecaca',
                        color: 'var(--color-accent)',
                        fontSize: 14,
                        marginBottom: 24,
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Basic Details Card */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                        Basic Information
                    </h2>

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="recipe-title-input"
                            style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                        >
                            Recipe Title <span style={{ color: 'var(--color-accent)' }}>*</span>
                        </label>
                        <input
                            id="recipe-title-input"
                            type="text"
                            required
                            placeholder="e.g. Creamy Garlic Butter Tuscan Salmon"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle()}
                        />
                    </div>

                    {/* Category & Cover Image — stack on mobile */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: 16,
                    }}>
                        <div>
                            <label
                                htmlFor="recipe-category-select"
                                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                            >
                                Category
                            </label>
                            <select
                                id="recipe-category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={inputStyle()}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Cover Photo
                            </label>
                            {image ? (
                                <div
                                    style={{
                                        position: 'relative',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: '1px solid var(--color-border)',
                                        background: '#000',
                                        height: 140,
                                    }}
                                >
                                    <img
                                        src={image}
                                        alt="Cover Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                            display: 'flex',
                                            gap: 6,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(true)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 6,
                                                background: 'rgba(0, 0, 0, 0.75)',
                                                color: '#fff',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImage('')}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 6,
                                                background: 'rgba(239, 68, 68, 0.85)',
                                                color: '#fff',
                                                border: 'none',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    style={{
                                        width: '100%',
                                        padding: '20px 16px',
                                        borderRadius: 10,
                                        border: '2px dashed var(--color-border)',
                                        background: 'var(--color-bg)',
                                        color: 'var(--color-text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        transition: 'border-color 0.15s ease, background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-accent-soft)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; }}
                                >
                                    <span>📸</span> Upload & Edit Photo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Short Description */}
                    <div>
                        <label
                            htmlFor="recipe-desc-input"
                            style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                        >
                            Short Description / Summary <span style={{ color: 'var(--color-accent)' }}>*</span>
                        </label>
                        <textarea
                            id="recipe-desc-input"
                            required
                            rows={3}
                            placeholder="Briefly describe your dish, flavor profile, or why you love it..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={inputStyle({ resize: 'vertical' })}
                        />
                    </div>

                    {/* Prep, Cook, Servings — 3 cols on desktop, 2 on tablet, 1 on mobile */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr',
                        gap: 14,
                    }}>
                        <div>
                            <label
                                htmlFor="recipe-prep-input"
                                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                            >
                                Prep Time
                            </label>
                            <input
                                id="recipe-prep-input"
                                type="text"
                                placeholder="e.g. 15 mins"
                                value={prepTime}
                                onChange={(e) => setPrepTime(e.target.value)}
                                style={inputStyle({ padding: '10px 12px' })}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="recipe-cook-input"
                                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                            >
                                Cook Time
                            </label>
                            <input
                                id="recipe-cook-input"
                                type="text"
                                placeholder="e.g. 20 mins"
                                value={cookTime}
                                onChange={(e) => setCookTime(e.target.value)}
                                style={inputStyle({ padding: '10px 12px' })}
                            />
                        </div>

                        <div style={isMobile ? { gridColumn: '1 / -1' } : {}}>
                            <label
                                htmlFor="recipe-servings-input"
                                style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                            >
                                Servings
                            </label>
                            <input
                                id="recipe-servings-input"
                                type="number"
                                min={1}
                                value={servings}
                                onChange={(e) => setServings(e.target.value)}
                                style={inputStyle({ padding: '10px 12px' })}
                            />
                        </div>
                    </div>
                </div>

                {/* Ingredients Card */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                            Ingredients
                        </h2>
                        <button
                            type="button"
                            onClick={addIngredient}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text-primary)',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            + Add Ingredient
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ingredients.map((ing, index) => (
                            <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    value={ing.amount}
                                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                    style={inputStyle({
                                        width: isMobile ? '100%' : 130,
                                        padding: '9px 12px',
                                    })}
                                />
                                <input
                                    type="text"
                                    placeholder="Ingredient name"
                                    value={ing.item}
                                    onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                                    style={inputStyle({
                                        flex: 1,
                                        minWidth: isMobile ? '100%' : 0,
                                        padding: '9px 12px',
                                    })}
                                />
                                {ingredients.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        aria-label="Remove ingredient"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            padding: 6,
                                            flexShrink: 0,
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions / Steps Card */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                            Preparation Steps
                        </h2>
                        <button
                            type="button"
                            onClick={addStep}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text-primary)',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            + Add Step
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {steps.map((step, index) => (
                            <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        background: 'var(--color-accent-soft)',
                                        color: 'var(--color-accent)',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: 6,
                                    }}
                                >
                                    {index + 1}
                                </span>
                                <textarea
                                    rows={2}
                                    placeholder={`Step ${index + 1} instructions...`}
                                    value={step}
                                    onChange={(e) => handleStepChange(index, e.target.value)}
                                    style={inputStyle({ resize: 'vertical', padding: '10px 12px' })}
                                />
                                {steps.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeStep(index)}
                                        aria-label="Remove step"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            padding: 6,
                                            marginTop: 6,
                                            flexShrink: 0,
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content & Tags */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                        Story & Tags
                    </h2>

                    <div>
                        <label
                            htmlFor="recipe-content-input"
                            style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                        >
                            Full Recipe Story / Blog Content
                        </label>
                        <textarea
                            id="recipe-content-input"
                            rows={5}
                            placeholder="Share the inspiration behind this recipe, tips for perfect execution, pairing ideas..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={inputStyle({ resize: 'vertical' })}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="recipe-tags-input"
                            style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                        >
                            Tags (comma separated)
                        </label>
                        <input
                            id="recipe-tags-input"
                            type="text"
                            placeholder="e.g. Salmon, Keto, Dinner, Healthy"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            style={inputStyle()}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    marginTop: 6,
                    flexDirection: isMobile ? 'column-reverse' : 'row',
                }}>
                    <Link
                        to="/"
                        style={{
                            padding: '13px 24px',
                            borderRadius: 10,
                            border: '1px solid var(--color-border)',
                            background: 'transparent',
                            color: 'var(--color-text-primary)',
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: 'none',
                            textAlign: 'center',
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        id="publish-recipe-btn"
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '13px 32px',
                            borderRadius: 10,
                            border: 'none',
                            background: 'var(--color-accent)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'background 0.15s ease',
                        }}
                    >
                        {submitting ? 'Publishing...' : 'Publish Recipe'}
                    </button>
                </div>
            </form>

            {/* Photo Upload & Editor Modal */}
            <ImageUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectImage={(imageData) => setImage(imageData)}
            />
        </div>
    );
}

export default CreatePost;
