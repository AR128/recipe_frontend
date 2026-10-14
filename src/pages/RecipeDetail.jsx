import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getRecipe } from '../api/recipeApi';
import CommentSection from '../components/CommentSection';

// TASK 5: Safe LocalStorage parsing helper
const getSavedFavorites = () => {
    try {
        const stored = localStorage.getItem('poodiest-favorites');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to parse favorites from local storage:', error);
        return []; // Fallback safely to empty array if data is corrupted
    }
};

export default function RecipeDetail() {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkedIngs, setCheckedIngs] = useState(new Set());
    const [baseServings, setBaseServings] = useState(4);
    const [servings, setServings] = useState(4);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError('');

        getRecipe(slug)
            .then((data) => {
                const fetchedRecipe = data.recipe || data;
                setRecipe(fetchedRecipe);
                const initialServings = Number(fetchedRecipe.servings) > 0 ? Number(fetchedRecipe.servings) : 4;
                setBaseServings(initialServings);
                setServings(initialServings);
            })
            .catch(() => setError('Failed to load recipe. Please try again.'))
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!slug) return;
        const savedFavorites = getSavedFavorites();
        setIsFavorite(savedFavorites.includes(slug));
    }, [slug]);

    const ingredients = recipe?.ingredients || [];
    const instructions = recipe?.steps || recipe?.instructions || [];
    const tags = recipe?.tags || [];
    const authorName = recipe?.author?.name || recipe?.author?.username || recipe?.authorName || 'The Culinary Team';
    const recipeImage = recipe?.image || recipe?.imageUrl || recipe?.coverImage || '';
    const description = recipe?.description || '';
    const story = recipe?.content || recipe?.story || recipe?.notes || '';

    const totalMinutesText = useMemo(() => {
        const values = [recipe?.prepTime, recipe?.cookTime].filter(Boolean);
        return values.length ? values.join(' + ') : '';
    }, [recipe]);

    const toggleFavorite = () => {
        const savedFavorites = getSavedFavorites();
        let updatedFavorites;
        if (savedFavorites.includes(slug)) {
            updatedFavorites = savedFavorites.filter((id) => id !== slug);
            setIsFavorite(false);
        } else {
            updatedFavorites = [...savedFavorites, slug];
            setIsFavorite(true);
        }
        localStorage.setItem('poodiest-favorites', JSON.stringify(updatedFavorites));
    };

    const toggleIngredient = (index) => {
        setCheckedIngs((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const scaleAmount = (amount) => {
        if (!amount) return '';
        const match = String(amount).match(/^(\d*\.?\d+)\s*(.*)/);
        if (!match) return amount;
        const number = parseFloat(match[1]);
        const unit = match[2];
        const scaled = (number * servings) / baseServings;
        return `${Number(scaled.toFixed(1))}${unit ? ` ${unit}` : ''}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors duration-200 flex items-center justify-center">
                <span className="font-serif text-2xl text-neutral-400 dark:text-neutral-500 italic animate-pulse">Preparing recipe...</span>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors duration-200 flex flex-col items-center justify-center px-6">
                <h1 className="font-serif text-4xl text-neutral-900 dark:text-white mb-6 transition-colors">{error ? 'Something went wrong' : 'Recipe not found'}</h1>
                <Link to="/" className="text-xs text-neutral-900 dark:text-white font-bold uppercase tracking-widest border-b border-neutral-900 dark:border-white pb-1 hover:opacity-60 transition-all">
                    Return to feed
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-200">
            
            {/* CINEMATIC HEADER */}
            <header className="w-full relative">
                <div className="w-full aspect-video md:aspect-21/9 bg-neutral-200 dark:bg-neutral-800 transition-colors overflow-hidden">
                    {recipeImage ? (
                        <img src={recipeImage} alt={recipe.title} className="w-full h-full object-cover grayscale-[15%]" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl text-neutral-400 dark:text-neutral-500">🍽️</div>
                    )}
                </div>
            </header>

            {/* EDITORIAL TITLE & METADATA */}
            <div className="max-w-300 mx-auto px-6 lg:px-12 pt-12 pb-16 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
                
                <div className="flex items-center justify-between mb-10">
                    <Link to="/" className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        ← Back to feed
                    </Link>
                    <button 
                        onClick={toggleFavorite}
                        className={`text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 ${isFavorite ? 'text-orange-600 dark:text-orange-500' : 'text-neutral-900 dark:text-white hover:opacity-60'}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {isFavorite ? 'Saved' : 'Save'}
                    </button>
                </div>

                {recipe.category && (
                    <span className="block text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 mb-4 transition-colors">
                        {recipe.category}
                    </span>
                )}
                
                <h1 className="text-5xl md:text-7xl font-serif font-medium text-neutral-900 dark:text-white leading-[1.05] tracking-tighter mb-8 max-w-4xl transition-colors">
                    {recipe.title}
                </h1>
                
                <p className="text-xl text-neutral-600 dark:text-neutral-300 font-light max-w-3xl leading-relaxed mb-10 transition-colors">
                    {description}
                </p>

                <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-sm transition-colors">
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1 transition-colors">Author</span>
                        <span className="font-serif text-lg">{authorName}</span>
                    </div>
                    {totalMinutesText && (
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1 transition-colors">Time</span>
                            <span className="font-serif text-lg">{totalMinutesText}</span>
                        </div>
                    )}
                    {recipe.servings && (
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1 transition-colors">Yield</span>
                            <span className="font-serif text-lg">{recipe.servings} Servings</span>
                        </div>
                    )}
                </div>
            </div>

            {/* STRICT TWO-COLUMN GRID */}
            <div className="max-w-300 mx-auto px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                {/* LEFT COLUMN: INGREDIENTS */}
                <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
                    <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-900 dark:border-white transition-colors">
                        <h2 className="font-serif text-3xl text-neutral-900 dark:text-white transition-colors">Ingredients</h2>
                    </div>

                    <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-4 mb-8 transition-colors">
                        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 transition-colors">Servings</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-neutral-900 dark:text-white hover:opacity-60 text-lg leading-none transition-colors">−</button>
                            <span className="font-serif text-lg w-4 text-center">{servings}</span>
                            <button onClick={() => setServings(servings + 1)} className="text-neutral-900 dark:text-white hover:opacity-60 text-lg leading-none transition-colors">+</button>
                        </div>
                    </div>

                    <ul className="space-y-4">
                        {ingredients.length > 0 ? (
                            ingredients.map((ingredient, index) => {
                                const checked = checkedIngs.has(index);
                                const amount = typeof ingredient === 'string' ? '' : ingredient?.amount;
                                const item = typeof ingredient === 'string' ? ingredient : ingredient?.item || ingredient?.name || '';

                                return (
                                    <li key={index} className="group flex items-start gap-4">
                                        <button 
                                            type="button" 
                                            onClick={() => toggleIngredient(index)}
                                            className={`mt-1 w-4 h-4 shrink-0 border flex items-center justify-center transition-colors focus:outline-none ${
                                                checked 
                                                    ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white' 
                                                    : 'bg-transparent border-neutral-900 dark:border-white'
                                            }`}
                                        >
                                            {checked && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white dark:text-neutral-900">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </button>
                                        <div className={`text-base leading-relaxed transition-all duration-300 ${checked ? 'opacity-40 line-through text-neutral-500 dark:text-neutral-400' : 'opacity-100 text-neutral-900 dark:text-neutral-200'}`}>
                                            {amount && <span className="font-bold mr-2">{scaleAmount(amount)}</span>}
                                            <span>{item}</span>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="text-sm italic text-neutral-400 dark:text-neutral-500">No ingredients listed.</li>
                        )}
                    </ul>
                </aside>

                {/* RIGHT COLUMN: PREPARATION & STORY */}
                <article className="lg:col-span-8">
                    
                    <h2 className="font-serif text-3xl text-neutral-900 dark:text-white mb-8 pb-4 border-b border-neutral-900 dark:border-white transition-colors">Preparation</h2>
                    
                    <div className="space-y-12 mb-20">
                        {instructions.length > 0 ? (
                            instructions.map((step, index) => {
                                const text = typeof step === 'string' ? step : step?.step || step?.text || '';
                                return (
                                    <div key={index} className="flex flex-col sm:flex-row gap-6 sm:gap-10">
                                        <div className="sm:w-16 shrink-0">
                                            <span className="font-serif text-2xl font-light text-neutral-400 dark:text-neutral-500 transition-colors">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <p className="text-lg leading-relaxed text-neutral-900 dark:text-neutral-200 transition-colors">
                                            {text}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm italic text-neutral-400 dark:text-neutral-500">No preparation instructions provided.</p>
                        )}
                    </div>

                    {/* STORY / NOTES SECTION */}
                    {story && (
                        <div className="pt-16 border-t border-neutral-200 dark:border-neutral-800 mb-20 transition-colors">
                            <h2 className="font-serif text-2xl text-neutral-900 dark:text-white mb-6 transition-colors">Behind the Recipe</h2>
                            <div className="text-lg leading-loose text-neutral-600 dark:text-neutral-300 whitespace-pre-line transition-colors">
                                {story}
                            </div>
                        </div>
                    )}

                    {/* TAGS */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-12 border-t border-neutral-200 dark:border-neutral-800 mb-20 transition-colors">
                            {tags.map((tag, index) => (
                                <Link 
                                    key={index} 
                                    to={`/?search=${tag}`} 
                                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-colors"
                                >
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* COMMENTS */}
                    <div className="pt-16 border-t border-neutral-900 dark:border-white transition-colors">
                        <h2 className="font-serif text-2xl text-neutral-900 dark:text-white mb-8 transition-colors">Community Notes</h2>
                        <CommentSection slug={slug} />
                    </div>

                </article>
            </div>
        </div>
    );
}