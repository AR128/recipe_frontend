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
    <div className="h-screen flex flex-col md:flex-row bg-white font-sans text-neutral-900 overflow-hidden">
      
      {/* FORM SIDE (Left) - Tightened padding so it fits without scrolling */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-screen overflow-y-auto flex items-center justify-center p-6 md:p-8 lg:p-12 order-2 md:order-1">
        <div className="w-full max-w-sm m-auto">
          
          <Link to="/" className="font-serif text-3xl font-bold text-black tracking-tight block mb-6 hover:opacity-70 transition-opacity">
            Poodiest.
          </Link>

          <h2 className="font-serif text-3xl lg:text-4xl text-black mb-2">
            Join us.
          </h2>
          <p className="text-neutral-500 text-sm mb-6">
            Create an account to save recipes and follow top chefs.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-neutral-100 border-l-4 border-black text-black text-sm">
              {error}
            </div>
          )}

          {/* Tightened gap between inputs (space-y-4) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 mb-1.5">
                Chef Name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-none bg-transparent text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="How should we call you?"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-none bg-transparent text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-none bg-transparent text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="Minimum 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 mt-4 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating profile...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 pb-4 md:pb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium hover:underline">
              Log in
            </Link>
          </p>
          
        </div>
      </div>

      {/* IMAGE SIDE (Right) */}
      <div className="w-full md:w-1/2 h-[30vh] md:h-screen relative shrink-0 order-1 md:order-2">
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