import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-[#E5E5E5] pt-20 pb-10 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-20">
          
          {/* Brand Column */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start">
            <span className="font-serif text-4xl font-bold text-[#1A1A1A] tracking-tighter leading-none mb-6">
              Poodiest.
            </span>
            <p className="text-lg text-[#666666] font-light leading-relaxed max-w-md">
              A curated space for those who respect technique. Find precise measurements, honest notes, and recipes that actually work.
            </p>
          </div>

          {/* Navigation Column 1 */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] mb-8">Platform</h4>
            <ul className="flex flex-col gap-5 text-sm font-medium text-[#8C8C8C]">
              <li><Link to="/" className="hover:text-[#1A1A1A] transition-colors">Home Feed</Link></li>
              <li><Link to="#category" className="hover:text-[#1A1A1A] transition-colors">Categories</Link></li>
              <li><Link to="/users" className="hover:text-[#1A1A1A] transition-colors">Explore Chefs</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] mb-8">Community</h4>
            <ul className="flex flex-col gap-5 text-sm font-medium text-[#8C8C8C]">
              <li><Link to="/login" className="hover:text-[#1A1A1A] transition-colors">Log In</Link></li>
              <li><Link to="/signup" className="hover:text-[#1A1A1A] transition-colors">Create Account</Link></li>
              <li><Link to="#about" className="hover:text-[#1A1A1A] transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5E5E5] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Poodiest. All rights reserved.</p>
          <p>Crafted for home chefs.</p>
        </div>

      </div>
    </footer>
  );
}