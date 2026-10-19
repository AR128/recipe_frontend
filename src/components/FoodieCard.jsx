import { Link } from 'react-router';

export default function FoodieCard({ user }) {
  const initials = (user.name || user.username || '?').slice(0, 2).toUpperCase();
  const avatar = user.avatar || user.profileImage || user.image;

  return (
    <Link
      to={`/user/${user.username}`}
      className="group relative bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 inset-x-6 h-0.5 bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent group-hover:via-[#C9A96E] transition-all" />

      {/* Avatar */}
      <div className="relative mb-4">
        {avatar ? (
          <img
            src={avatar}
            alt={user.name || user.username}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#C9A96E]/30 shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#121210] font-serif font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            {initials}
          </div>
        )}
      </div>

      {/* Name and Handle */}
      <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-white truncate w-full mb-1 group-hover:text-[#C9A96E] transition-colors">
        {user.name || user.username}
      </h4>
      <p className="text-xs text-[#C9A96E] font-medium mb-3">
        @{user.username}
      </p>

      {/* Real Recipe Count or Join Date from MongoDB */}
      <div className="mb-4">
        {user.recipeCount !== undefined && user.recipeCount > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C9A96E]/15 text-[#b0873a] dark:text-[#E7CA8D]">
            <span>🍳</span> {user.recipeCount} {user.recipeCount === 1 ? 'Recipe Shared' : 'Recipes Shared'}
          </span>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
            {user.bio ? user.bio : user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString()}` : 'Food blogger'}
          </p>
        )}
      </div>

      {/* CTA Button */}
      <div className="w-full mt-auto pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-200 group-hover:text-[#C9A96E] transition-colors">
        <span>View Kitchen</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </Link>
  );
}