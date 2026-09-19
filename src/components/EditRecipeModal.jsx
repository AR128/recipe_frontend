import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { updateRecipePost, uploadImage } from '../api/recipeApi';
import ImageUploadModal from './ImageUploadModal';

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

function EditRecipeModal({ isOpen, onClose, recipe, onRecipeUpdated }) {
    const { accessToken, token } = useAuth();
    const authToken = accessToken || token;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [servings, setServings] = useState(4);
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [ingredients, setIngredients] = useState([{ amount: '', item: '' }]);
    const [steps, setSteps] = useState(['']);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [prevRecipe, setPrevRecipe] = useState(null);

    // Synchronize form state when recipe prop changes (during render to avoid cascading useEffect renders)
    if (recipe && recipe !== prevRecipe) {
        setPrevRecipe(recipe);
        setTitle(recipe.title || '');
        setCategory(recipe.category || 'General');
        setDescription(recipe.description || '');
        setImage(recipe.image || '');
        setPrepTime(recipe.prepTime || '');
        setCookTime(recipe.cookTime || '');
        setServings(recipe.servings || 4);
        setTags(Array.isArray(recipe.tags) ? recipe.tags.join(', ') : recipe.tags || '');
        setContent(recipe.content || '');
        setIngredients(
            Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
                ? recipe.ingredients.map((ing) => ({ amount: ing.amount || '', item: ing.item || '' }))
                : [{ amount: '', item: '' }]
        );
        setSteps(
            Array.isArray(recipe.steps) && recipe.steps.length > 0
                ? recipe.steps.map((s) => (typeof s === 'string' ? s : s.text || ''))
                : ['']
        );
        setError('');
    } else if (!recipe && prevRecipe !== null) {
        setPrevRecipe(null);
    }

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !recipe) return null;

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

        const validIngredients = ingredients.filter((ing) => ing.item.trim() !== '');
        const validSteps = steps.map((s) => s.trim()).filter(Boolean);

        setSubmitting(true);

        try {
            let finalImageUrl = image.trim();

            if (finalImageUrl.startsWith('data:image/')) {
                try {
                    const uploadRes = await uploadImage(finalImageUrl, authToken);
                    if (uploadRes && uploadRes.url) {
                        finalImageUrl = uploadRes.url;
                    }
                } catch (uploadErr) {
                    console.error('Cloudinary upload failed:', uploadErr);
                    setError('Failed to upload image to Cloudinary. Please try again.');
                    setSubmitting(false);
                    return;
                }
            }

            const updatedData = await updateRecipePost(
                recipe._id,
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

            if (onRecipeUpdated) {
                onRecipeUpdated(updatedData.recipe || updatedData);
            }
            onClose();
        } catch (err) {
            console.error('Update recipe error:', err);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Failed to update recipe post. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
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
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--color-surface, #1e293b)',
                    color: 'var(--color-text-primary, #f8fafc)',
                    borderRadius: 20,
                    width: '100%',
                    maxWidth: 780,
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    border: '1px solid var(--color-border, #334155)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                        ✏️ Edit Recipe Post
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            fontSize: 22,
                            cursor: 'pointer',
                            padding: 4,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 14 }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Basic Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Recipe Title <span style={{ color: 'var(--color-accent)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 14,
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg)',
                                        color: 'var(--color-text-primary)',
                                        fontSize: 14,
                                    }}
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
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <img src={image} alt="Cover" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => setIsImageModalOpen(true)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: 8,
                                                border: '1px solid var(--color-border)',
                                                background: 'var(--color-surface-2)',
                                                color: 'var(--color-text-primary)',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✏️ Change Photo
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsImageModalOpen(true)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: 8,
                                            border: '1px dashed var(--color-border)',
                                            background: 'var(--color-bg)',
                                            color: 'var(--color-accent)',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        📸 Upload Food Photo
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Short Description <span style={{ color: 'var(--color-accent)' }}>*</span>
                            </label>
                            <textarea
                                required
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 13,
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prep Time</label>
                                <input
                                    type="text"
                                    value={prepTime}
                                    onChange={(e) => setPrepTime(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Cook Time</label>
                                <input
                                    type="text"
                                    value={cookTime}
                                    onChange={(e) => setCookTime(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Servings</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={servings}
                                    onChange={(e) => setServings(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <label style={{ fontSize: 14, fontWeight: 700 }}>Ingredients</label>
                            <button type="button" onClick={addIngredient} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                + Add
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {ingredients.map((ing, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Amount"
                                        value={ing.amount}
                                        onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                                        style={{ width: 110, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Ingredient item"
                                        value={ing.item}
                                        onChange={(e) => handleIngredientChange(idx, 'item', e.target.value)}
                                        style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                                    />
                                    {ingredients.length > 1 && (
                                        <button type="button" onClick={() => removeIngredient(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Steps */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <label style={{ fontSize: 14, fontWeight: 700 }}>Preparation Steps</label>
                            <button type="button" onClick={addStep} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                + Add Step
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {steps.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', width: 18 }}>{idx + 1}.</span>
                                    <input
                                        type="text"
                                        value={step}
                                        onChange={(e) => handleStepChange(idx, e.target.value)}
                                        style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                                    />
                                    {steps.length > 1 && (
                                        <button type="button" onClick={() => removeStep(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content & Tags */}
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Recipe Story & Content</label>
                        <textarea
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13, resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)', fontSize: 13 }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSelectImage={(imageData) => setImage(imageData)}
            />
        </div>
    );
}

export default EditRecipeModal;
