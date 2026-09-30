import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getRecipe } from '../api/recipeApi';
import CommentSection from '../components/CommentSection';

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
        const savedFavorites = JSON.parse(localStorage.getItem('poodiest-favorites') || '[]');
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
        const savedFavorites = JSON.parse(localStorage.getItem('poodiest-favorites') || '[]');
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
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <span className="font-serif text-2xl text-[#A3A3A3] italic animate-pulse">Preparing recipe...</span>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
                <h1 className="font-serif text-4xl text-[#1A1A1A] mb-6">{error ? 'Something went wrong' : 'Recipe not found'}</h1>
                <Link to="/" className="text-xs font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 hover:opacity-60 transition-opacity">
                    Return to feed
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
            
            {/* CINEMATIC HEADER (No blur, no floating buttons. Pure architecture) */}
            <header className="w-full relative">
                <div className="w-full aspect-video md:aspect-[21/9] bg-[#E5E5E5] overflow-hidden">
                    {recipeImage ? (
                        <img src={recipeImage} alt={recipe.title} className="w-full h-full object-cover grayscale-[15%]" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl text-[#A3A3A3]">🍽️</div>
                    )}
                </div>
            </header>

            {/* EDITORIAL TITLE & METADATA */}
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-12 pb-16 border-b border-[#E5E5E5]">
                
                <div className="flex items-center justify-between mb-10">
                    <Link to="/" className="text-xs font-semibold uppercase tracking-widest text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors">
                        ← Back to feed
                    </Link>
                    <button 
                        onClick={toggleFavorite}
                        className={`text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 ${isFavorite ? 'text-orange-600' : 'text-[#1A1A1A] hover:opacity-60'}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {isFavorite ? 'Saved' : 'Save'}
                    </button>
                </div>

                {recipe.category && (
                    <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#8C8C8C] mb-4">
                        {recipe.category}
                    </span>
                )}
                
                <h1 className="text-5xl md:text-7xl font-serif font-medium text-[#1A1A1A] leading-[1.05] tracking-tighter mb-8 max-w-4xl">
                    {recipe.title}
                </h1>
                
                <p className="text-xl text-[#666666] font-light max-w-3xl leading-relaxed mb-10">
                    {description}
                </p>

                <div className="flex flex-wrap items-center gap-x-12 gap-y-6 pt-8 border-t border-[#E5E5E5] text-sm">
                    <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#A3A3A3] mb-1">Author</span>
                        <span className="font-serif text-lg">{authorName}</span>
                    </div>
                    {totalMinutesText && (
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#A3A3A3] mb-1">Time</span>
                            <span className="font-serif text-lg">{totalMinutesText}</span>
                        </div>
                    )}
                    {recipe.servings && (
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#A3A3A3] mb-1">Yield</span>
                            <span className="font-serif text-lg">{recipe.servings} Servings</span>
                        </div>
                    )}
                </div>
            </div>

            {/* STRICT TWO-COLUMN GRID */}
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

                {/* LEFT COLUMN: INGREDIENTS */}
                <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
                    <div className="flex items-end justify-between mb-8 pb-4 border-b border-[#1A1A1A]">
                        <h2 className="font-serif text-3xl text-[#1A1A1A]">Ingredients</h2>
                    </div>

                    <div className="flex items-center justify-between bg-[#F2F2F2] p-4 mb-8">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#666666]">Servings</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setServings(Math.max(1, servings - 1))} className="text-[#1A1A1A] hover:opacity-60 text-lg leading-none">−</button>
                            <span className="font-serif text-lg w-4 text-center">{servings}</span>
                            <button onClick={() => setServings(servings + 1)} className="text-[#1A1A1A] hover:opacity-60 text-lg leading-none">+</button>
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
                                            className="mt-1 w-4 h-4 shrink-0 border border-[#1A1A1A] flex items-center justify-center transition-colors focus:outline-none"
                                            style={{ backgroundColor: checked ? '#1A1A1A' : 'transparent' }}
                                        >
                                            {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                                        </button>
                                        <div className={`text-base leading-relaxed transition-opacity duration-300 ${checked ? 'opacity-40 line-through' : 'opacity-100'}`}>
                                            {amount && <span className="font-bold mr-2">{scaleAmount(amount)}</span>}
                                            <span className="text-[#666666]">{item}</span>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="text-sm italic text-[#A3A3A3]">No ingredients listed.</li>
                        )}
                    </ul>
                </aside>

                {/* RIGHT COLUMN: PREPARATION & STORY */}
                <article className="lg:col-span-8">
                    
                    <h2 className="font-serif text-3xl text-[#1A1A1A] mb-8 pb-4 border-b border-[#1A1A1A]">Preparation</h2>
                    
                    <div className="space-y-12 mb-20">
                        {instructions.length > 0 ? (
                            instructions.map((step, index) => {
                                const text = typeof step === 'string' ? step : step?.step || step?.text || '';
                                return (
                                    <div key={index} className="flex flex-col sm:flex-row gap-6 sm:gap-10">
                                        <div className="sm:w-16 shrink-0">
                                            <span className="font-serif text-2xl font-light text-[#A3A3A3]">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <p className="text-lg leading-relaxed text-[#1A1A1A]">
                                            {text}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm italic text-[#A3A3A3]">No preparation instructions provided.</p>
                        )}
                    </div>

                    {/* STORY / NOTES SECTION */}
                    {story && (
                        <div className="pt-16 border-t border-[#E5E5E5] mb-20">
                            <h2 className="font-serif text-2xl text-[#1A1A1A] mb-6">Behind the Recipe</h2>
                            <div className="text-lg leading-loose text-[#666666] whitespace-pre-line">
                                {story}
                            </div>
                        </div>
                    )}

                    {/* TAGS */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-12 border-t border-[#E5E5E5] mb-20">
                            {tags.map((tag, index) => (
                                <Link key={index} to={`/?search=${tag}`} className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold uppercase tracking-widest text-[#8C8C8C] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* COMMENTS */}
                    <div className="pt-16 border-t border-[#1A1A1A]">
                        <h2 className="font-serif text-2xl text-[#1A1A1A] mb-8">Community Notes</h2>
                        <CommentSection recipeId={recipe._id} />
                    </div>

                </article>
            </div>
        </div>
    );
}