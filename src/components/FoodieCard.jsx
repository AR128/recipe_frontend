import React from 'react';
import { Link } from 'react-router';

export default function FoodieCard({ user }) {
  const initials = (user.name || user.username || '?').slice(0, 2).toUpperCase();

  return (
    <Link
      to={`/user/${user.username}`}
      className="no-underline bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
        {initials}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="text-base font-bold text-gray-900 m-0 mb-0.5 truncate group-hover:text-orange-500 transition-colors">
          {user.name || user.username}
        </h4>
        <p className="text-xs text-orange-500 font-semibold m-0">
          @{user.username}
        </p>
      </div>
      <span className="text-sm text-gray-400 group-hover:translate-x-1 transition-transform shrink-0">→</span>
    </Link>
  );
}