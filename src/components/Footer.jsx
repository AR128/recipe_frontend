import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="w-full bg-[#11110f] text-neutral-300 border-t border-white/10 pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-12 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 mb-12 sm:mb-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 mb-4 sm:mb-5 group">
              <span className="w-8 h-8 rounded-full bg-[#C9A96E] text-[#121210] flex items-center justify-center font-serif font-black text-lg">
                P
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-[#C9A96E] transition-colors">
                Poodiest<span className="text-[#C9A96E]">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-sm mb-5 sm:mb-6">
              An independent culinary journal dedicated to technique, reliable
              recipes, and the honest joy of cooking at home.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-semibold text-[#C9A96E] tracking-widest uppercase">
              <span>Eat Well</span>
              <span>•</span>
              <span>Cook Often</span>
              <span>•</span>
              <span>Share Generously</span>
            </div>
          </div>

          {/* Navigation Column 1: Explore */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-6">
              Explore
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Latest Recipes
                </Link>
              </li>
              <li>
                <a
                  href="/#categories"
                  className="hover:text-white transition-colors"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#creators"
                  className="hover:text-white transition-colors"
                >
                  Community Cooks
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Recipes */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-6">
              Cuisines
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li>
                <Link
                  to="/recipes?search=Pasta"
                  className="hover:text-white transition-colors"
                >
                  Artisan Pasta
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes?search=Breakfast"
                  className="hover:text-white transition-colors"
                >
                  Weekend Brunch
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes?search=Quick"
                  className="hover:text-white transition-colors"
                >
                  30-Min Dinners
                </Link>
              </li>
              <li>
                <Link
                  to="/recipes?search=Dessert"
                  className="hover:text-white transition-colors"
                >
                  Baking &amp; Pastry
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Community */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-6">
              Community
            </h4>
            <ul className="flex flex-col sm:flex-row md:flex-col gap-3 text-sm text-neutral-400">
              <li>
                <Link
                  to="/get-started"
                  className="hover:text-white transition-colors"
                >
                  Get started and save recipes
                </Link>
              </li>
              <li>
                <Link
                  to="/create-post"
                  className="hover:text-white transition-colors"
                >
                  Share Your Recipe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Poodiest Culinary Journal. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <span>Crafted for home cooks &amp; food bloggers</span>
            <span>•</span>
            <span>Open Recipe Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
