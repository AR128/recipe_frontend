import { Link } from 'react-router'; 

export default function RecipeCard({ recipe }) { 
  const { slug, title, description, image, authorName, category, cookTime, prepTime, createdAt } = recipe; 

  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    : ''; 

  const totalTime = (() => { 
    const parts = [prepTime, cookTime].filter(Boolean); 
    return parts.length > 0 ? parts.join(' + ') : ''; 
  })(); 

  return ( 
    <Link to={`/recipe/${slug}`} className="block h-full group"> 
      <article className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 transform group-hover:-translate-y-2 flex flex-col h-full"> 
        
        {/* Image Section */} 
        <div className="relative h-56 overflow-hidden bg-orange-50 shrink-0"> 
          {image ? ( 
            <img 
              src={image} 
              alt={title} 
              loading="lazy" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            /> 
          ) : ( 
            <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div> 
          )} 
          
          {/* Category Badge */} 
          {category && ( 
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm"> 
              {category} 
            </span> 
          )}

          {/* Favorite Button Icon (Placeholder for the future) */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
        </div> 

        {/* Content Section */} 
        <div className="p-6 flex flex-col flex-1 gap-3"> 
          <h3 className="text-xl font-extrabold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors duration-200"> 
            {title} 
          </h3> 
          
          <p className="text-sm text-gray-500 line-clamp-2 flex-1 leading-relaxed"> 
            {description} 
          </p> 

          {/* Meta Footer */} 
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"> 
            
            {/* Chef Info */}
            <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700"> 
              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
                {(authorName || 'C')[0].toUpperCase()}
              </div>
              {authorName || 'Chef'} 
            </div> 

            {/* Time & Date */}
            <div className="flex items-center gap-3"> 
              {totalTime && ( 
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"> 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"> 
                    <circle cx="12" cy="12" r="10"/> 
                    <polyline points="12 6 12 12 16 14"/> 
                  </svg> 
                  {totalTime} 
                </span> 
              )} 
            </div> 
          </div> 
        </div> 
      </article> 
    </Link> 
  ); 
}