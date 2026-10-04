import { useMemo } from 'react';
import { Link } from 'react-router';

export default function RecipeCard({ recipe }) {
    const { slug, title, image, authorName, category, cookTime, prepTime } = recipe || {};

    // Calculate total time safely
    const totalTime = useMemo(() => {
        const prep = parseInt(prepTime) || 0;
        const cook = parseInt(cookTime) || 0;
        const total = prep + cook;
        return total > 0 ? `${total} min` : '';
    }, [prepTime, cookTime]);

    if (!recipe) return null;

    return (
        <Link 
            to={`/recipe/${slug}`} 
            className="group flex flex-col gap-4 outline-none"
        >
            {/* 1. The Portrait Image Frame (No drop shadows, just a crisp 1px border) */}
            <div className="w-full aspect-4/5 rounded-2xl overflow-hidden bg-stone-200 border border-stone-200/60 relative">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-focus-visible:scale-105"
                        onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1495195134817-a1a280021697?q=80&w=600&auto=format&fit=crop';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-100">
                        🍽️
                    </div>
                )}
                
                {/* Subtle gradient overlay at the bottom so we could put text there later if needed, but mostly for depth */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* 2. The Unboxed Editorial Text */}
            <div className="flex flex-col items-start px-1">
                <div className="flex items-center justify-between w-full mb-2">
                    {/* Minimalist Category Label */}
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                        {category || 'Recipe'}
                    </span>
                    
                    {/* Clean Time Indicator */}
                    {totalTime && (
                        <span className="text-xs font-medium text-stone-400 flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {totalTime}
                        </span>
                    )}
                </div>

                {/* Sharp Serif Title */}
                <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {title}
                </h3>

                {/* Subtle Author Attribution */}
                {authorName && (
                    <p className="mt-2 text-sm text-stone-500 font-medium">
                        By <span className="text-stone-700">{authorName}</span>
                    </p>
                )}
            </div>
        </Link>
    );
}