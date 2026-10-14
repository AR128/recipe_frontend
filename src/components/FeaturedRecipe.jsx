import { Link } from 'react-router';

export default function FeaturedRecipe({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 border-b border-neutral-200 dark:border-neutral-800 pb-24 transition-colors">
      
      <Link to={`/recipe/${recipe.slug}`} className="block group w-full">
        {/* Sharp Editorial Image */}
        <div className="w-full aspect-4/3 relative overflow-hidden bg-neutral-200 dark:bg-neutral-800 transition-colors">
            {recipe.image ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 grayscale-15 group-hover:grayscale-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-neutral-400 dark:text-neutral-500 transition-colors">🍽️</div>
            )}
        </div>
      </Link>

      {/* Raw Editorial Typography */}
      <div className="flex flex-col justify-center items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-6 transition-colors">
          Recipe of the Day
        </span>
        
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-900 dark:text-white font-medium leading-[1.05] tracking-tight mb-6 line-clamp-3 transition-colors">
          {recipe.title}
        </h2>
        
        <p className="text-lg text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-10 line-clamp-3 max-w-lg transition-colors">
          {recipe.description}
        </p>
        
        {/* Minimalist Inline Link */}
        <Link
          to={`/recipe/${recipe.slug}`}
          className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:opacity-60 transition-opacity"
        >
          Read Full Recipe
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-300 group-hover:translate-x-2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

    </div>
  );
}