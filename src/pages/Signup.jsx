import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import signupImg from '../assets/Signup-image.avif';
import { useAuth } from '../context/useAuth';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-white dark:bg-[#0a0a0a] font-sans text-neutral-900 dark:text-white md:overflow-hidden transition-colors duration-200">
      
      {/* FORM SIDE (Left) */}
      <div className="w-full md:w-1/2 flex-1 md:h-screen overflow-y-auto flex items-center justify-center p-6 md:p-8 lg:p-12 order-2 md:order-1">
        <div className="w-full max-w-sm m-auto">
          
          <Link to="/" className="font-serif text-3xl font-bold text-black dark:text-white tracking-tight block mb-6 hover:opacity-70 transition-opacity">
            Poodiest.
          </Link>

          <h2 className="font-serif text-3xl lg:text-4xl text-black dark:text-white mb-2 transition-colors">
            Join us.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 transition-colors">
            Create an account to save recipes and follow top chefs.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800 border-l-4 border-black dark:border-white text-black dark:text-white text-sm transition-colors">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 dark:text-neutral-300 mb-1.5 transition-colors">
                Chef Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-none bg-transparent text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                placeholder="How should we call you?"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 dark:text-neutral-300 mb-1.5 transition-colors">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-none bg-transparent text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 dark:text-neutral-300 mb-1.5 transition-colors">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-none bg-transparent text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                placeholder="Minimum 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 mt-4 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating profile...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400 pb-4 md:pb-0 transition-colors">
            Already have an account?{' '}
            <Link to="/login" className="text-black dark:text-white font-medium hover:underline transition-colors">
              Log in
            </Link>
          </p>
          
        </div>
      </div>

      {/* IMAGE SIDE (Right) */}
      <div className="w-full md:w-1/2 h-40 sm:h-52 md:h-screen relative shrink-0 order-1 md:order-2">
        <img
          src={signupImg}
          alt="Signup background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>

    </div>
  );
}