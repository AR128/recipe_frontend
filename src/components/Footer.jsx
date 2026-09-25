import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6 md:px-12 mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Brand & Tagline */}
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-4 text-white">Poodiest</h2>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              The Recipe Authority. A curated platform for cooks who demand precision, context, and technique — not just ingredient lists.
            </p>
          </div>
          
          {/* Right Side: Newsletter Signup */}
          <div className="md:justify-self-end w-full max-w-md">
            <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-300">
              The recipe of the week, in your inbox.
            </h3>
            <form className="flex gap-4 items-end" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-transparent border-b border-gray-600 text-white focus:border-white focus:outline-none py-2 w-full transition-colors placeholder-gray-600"
              />
              <button 
                type="submit" 
                className="text-sm font-medium hover:text-gray-300 transition-colors pb-2 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Subtle Divider Line */}
        <div className="border-t border-gray-800 my-12"></div>

        {/* Bottom Section: Copyright & Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Poodiest. All rights reserved.
          </p>
          
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-widest text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <a href="/category" className="hover:text-white transition-colors">Category</a>
            <a href="/about" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;