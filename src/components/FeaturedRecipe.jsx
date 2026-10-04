import { Link } from 'react-router';

export default function FeaturedRecipe({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 border-b border-[#E5E5E5] pb-24">
      
      <Link to={`/recipe/${recipe.slug}`} className="block group w-full">
        {/* Sharp Editorial Image (No rounded corners or drop shadows) */}
        <div className="w-full aspect-4/3 relative overflow-hidden bg-[#E5E5E5]">
            {recipe.image ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 grayscale-15 group-hover:grayscale-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-[#A3A3A3]">🍽️</div>
            )}
        </div>
      </Link>

      {/* Raw Editorial Typography */}
      <div className="flex flex-col justify-center items-start">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8C8C] mb-6">
          Recipe of the Day
        </span>
        
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] font-medium leading-[1.05] tracking-tight mb-6 line-clamp-3">
          {recipe.title}
        </h2>
        
        <p className="text-lg text-[#666666] font-light leading-relaxed mb-10 line-clamp-3 max-w-lg">
          {recipe.description}
        </p>
        
        {/* Minimalist Inline Link (Instead of a chunky button) */}
        <Link
          to={`/recipe/${recipe.slug}`}
          className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-60 transition-opacity"
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