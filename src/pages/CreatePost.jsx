import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/useAuth';
import { createRecipePost, uploadImage } from '../api/recipeApi';
import ImageUploadModal from '../components/ImageUploadModal';
import defaultPlaceholder from '../assets/chef-placeholder.jpg';

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

function CreatePost() {
    const { accessToken, token } = useAuth();
    const authToken = accessToken || token;
    const navigate = useNavigate();

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

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleIngredientChange = (index, field, value) => {
        const next = [...ingredients];
        next[index][field] = value;
        setIngredients(next);
    };

    const addIngredient = () => setIngredients((prev) => [...prev, { amount: '', item: '' }]);
    
    const removeIngredient = (index) => {
        if (ingredients.length > 1) setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const handleStepChange = (index, value) => {
        const next = [...steps];
        next[index] = value;
        setSteps(next);
    };

    const addStep = () => setSteps((prev) => [...prev, '']);
    
    const removeStep = (index) => {
        if (steps.length > 1) setSteps((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !description.trim()) {
            setError('Title and Summary are required.');
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
                    if (uploadRes && uploadRes.url) finalImageUrl = uploadRes.url;
                } catch (uploadErr) {
                    console.error('Cloudinary upload failed:', uploadErr);
                    setError(uploadErr.response?.data?.message || 'Failed to upload image. Please try again.');
                    setSubmitting(false);
                    return;
                }
            }

            const data = await createRecipePost({
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
            }, authToken);

            navigate(data.recipe?.slug ? `/recipe/${data.recipe.slug}` : '/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to publish recipe. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Clean, high-contrast, trustworthy input styling
    const inputClasses = "w-full bg-white dark:bg-[#121212] border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-[15px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:focus:ring-white/20 focus:border-neutral-900 dark:focus:border-white transition-all placeholder-neutral-400 dark:placeholder-neutral-500 shadow-sm";
    const labelClasses = "block text-[14px] font-bold text-neutral-800 dark:text-neutral-200 mb-2";
    const cardClasses = "bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors mb-8";

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] py-10 transition-colors font-sans">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Page Header */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Feed
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                        Create a Recipe
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-[15px]">
                        Fill out the details below to share your dish with the community.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-sm font-semibold flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* Card 1: Visuals & Basics */}
                    <div className={cardClasses}>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Basic Information</h2>
                        
                        <div className="space-y-6">
                            {/* Prominent Image Upload */}
                            <div>
                                <label className={labelClasses}>Cover Photo <span className="text-red-500">*</span></label>
                                <div 
                                    onClick={() => setIsModalOpen(true)}
                                    className="relative w-full aspect-video md:aspect-[21/9] bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden cursor-pointer group border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
                                >
                                    {image ? (
                                        <>
                                            <img src={image} alt="Cover Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <span className="bg-white text-neutral-900 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md">
                                                    Change Photo
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative">
                                            <img src={defaultPlaceholder} alt="Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10 grayscale" />
                                            <div className="z-10 flex flex-col items-center bg-white/80 dark:bg-black/50 backdrop-blur-md px-6 py-4 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-700 dark:text-neutral-300 mb-2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                </svg>
                                                <span className="font-bold text-neutral-900 dark:text-white text-sm">Upload Image</span>
                                                <span className="text-xs text-neutral-500 mt-1">High resolution recommended</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="recipe-title" className={labelClasses}>Recipe Title <span className="text-red-500">*</span></label>
                                <input
                                    id="recipe-title"
                                    type="text"
                                    required
                                    placeholder="e.g. Creamy Garlic Butter Tuscan Salmon"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label htmlFor="recipe-desc" className={labelClasses}>Short Summary <span className="text-red-500">*</span></label>
                                <textarea
                                    id="recipe-desc"
                                    required
                                    rows={2}
                                    placeholder="Briefly describe your dish and why it's delicious..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`${inputClasses} resize-y`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Details & Tags */}
                    <div className={cardClasses}>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Recipe Details</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className={labelClasses}>Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClasses} cursor-pointer`}>
                                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Tags <span className="text-neutral-400 font-normal">(comma separated)</span></label>
                                <input type="text" placeholder="e.g. Keto, Quick, Dinner" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClasses} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                            <div>
                                <label className={labelClasses}>Prep Time</label>
                                <input type="text" placeholder="e.g. 15m" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Cook Time</label>
                                <input type="text" placeholder="e.g. 30m" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Servings</label>
                                <input type="number" min={1} placeholder="e.g. 4" value={servings} onChange={(e) => setServings(e.target.value)} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Ingredients */}
                    <div className={cardClasses}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Ingredients</h2>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                + Add Row
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="w-24 sm:w-32 shrink-0">
                                        <input type="text" placeholder="Amount" value={ing.amount} onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div className="flex-1">
                                        <input type="text" placeholder="Ingredient name" value={ing.item} onChange={(e) => handleIngredientChange(index, 'item', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div className="w-10 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            disabled={ingredients.length === 1}
                                            className="w-full h-[46px] flex items-center justify-center rounded-lg text-neutral-400 border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                            title="Remove"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 4: Instructions */}
                    <div className={cardClasses}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Instructions</h2>
                            <button
                                type="button"
                                onClick={addStep}
                                className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            >
                                + Add Step
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 mt-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center font-bold text-sm shrink-0 transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            rows={2}
                                            placeholder="Explain this step..."
                                            value={step}
                                            onChange={(e) => handleStepChange(index, e.target.value)}
                                            className={`${inputClasses} resize-y leading-relaxed`}
                                        />
                                    </div>
                                    <div className="w-10 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => removeStep(index)}
                                            disabled={steps.length === 1}
                                            className="w-full h-[46px] flex items-center justify-center rounded-lg text-neutral-400 border border-transparent hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                            title="Remove"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card 5: The Story */}
                    <div className={cardClasses}>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">The Story <span className="font-normal text-neutral-400 text-sm">(Optional)</span></h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Share the inspiration behind this recipe or tips for perfect execution.</p>
                        <textarea
                            rows={6}
                            placeholder="Start writing your article..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`${inputClasses} resize-y leading-relaxed`}
                        />
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 mt-8 pt-4">
                        <Link
                            to="/"
                            className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-transparent text-neutral-700 dark:text-neutral-300 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            id="publish-recipe-btn"
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                'Publish Recipe'
                            )}
                        </button>
                    </div>

                </form>

                <ImageUploadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelectImage={(imageData) => setImage(imageData)}
                />
            </div>
        </div>
    );
}

export default CreatePost;