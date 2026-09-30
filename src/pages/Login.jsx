import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import loginImg from '../assets/Login-image.avif';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white font-sans text-neutral-900 overflow-hidden">
      
      {/* IMAGE SIDE (Left) - Locked exactly to screen height */}
      <div className="w-full md:w-1/2 h-[30vh] md:h-screen relative shrink-0">
        <img
          src={loginImg}
          alt="Login background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>

      {/* FORM SIDE (Right) - Centers content, scrolls internally only if screen is tiny */}
      <div className="w-full md:w-1/2 h-[70vh] md:h-screen overflow-y-auto flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-sm m-auto">
          
          <Link to="/" className="font-serif text-3xl font-bold text-black tracking-tight block mb-10 hover:opacity-70 transition-opacity">
            Poodiest.
          </Link>

          <h1 className="font-serif text-4xl text-black mb-2">
            Welcome back.
          </h1>
          <p className="text-neutral-500 text-sm mb-10">
            Sign in to access your saved recipes and curated collections.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-neutral-100 border-l-4 border-black text-black text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-none bg-transparent text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-none bg-transparent text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 mt-4 text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Log in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500 pb-8 md:pb-0">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-medium hover:underline">
              Sign up
            </Link>
          </p>
          
        </div>
      </div>
    </div>
  );
}