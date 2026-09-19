import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import picture1 from '../assets/Picture1.png';
import { useAuth } from '../context/useAuth';

function Signup() {
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grow flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm flex max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
        {/* Left Side - Image */}
        <div className="w-1/2 hidden md:block">
          <img src={picture1} alt="Food" className="w-full h-full object-cover" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6 text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            Sign up
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-serif">User Name *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-gray-200 rounded p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-serif">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-serif">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc4c4c] text-white font-bold py-2.5 rounded hover:bg-[#c94343] transition-colors mt-4 font-serif text-xs tracking-wider disabled:opacity-60"
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-4 text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 font-serif">
              <Link to="/login" className="text-[#3b71ca] hover:underline">Already have an account? Log in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
