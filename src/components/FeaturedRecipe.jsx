import { Link } from 'react-router';

export default function FeaturedRecipe({ recipe }) {
  if (!recipe) return null;

  return (
    <div className="grid md:grid-cols-2 gap-10 items-center mb-16 bg-[#FDFBF7] p-6 md:p-10 rounded-3xl">
      <Link to={`/recipe/${recipe.slug}`} className="block group">
        {/* Left Side: Cinematic Image */}
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-2xl shadow-sm">
            {recipe.image ? (
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-orange-50 flex items-center justify-center text-6xl">🍽️</div>
            )}
        </div>
      </Link>

      {/* Right Side: Editorial Content */}
      <div className="flex flex-col justify-center">
        <span className="inline-block self-start px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
          Recipe of the Day
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight mb-4 line-clamp-2">
          {recipe.title}
        </h2>
        <p className="text-lg text-gray-600 mb-8 line-clamp-3">
          {recipe.description}
        </p>
        <Link
          to={`/recipe/${recipe.slug}`}
          className="bg-gray-900 text-white font-medium px-8 py-3 rounded-full hover:bg-gray-800 transition-all inline-flex items-center gap-2 self-start"
        >
          Read Recipe
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

    </div>
  );
}