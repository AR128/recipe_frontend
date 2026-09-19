import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import picture2 from '../assets/Picture2.png';
import { useAuth } from '../context/useAuth';

function Login() {
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
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'var(--color-bg, #f8f9fa)',
      }}
    >
      {/* Outer Card Container */}
      <div
        style={{
          display: 'flex',
          maxWidth: 880,
          width: '100%',
          background: '#ffffff',
          borderRadius: 36,
          border: '1px solid var(--color-border, #e5e7eb)',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Left Side: Image */}
        <div
          style={{
            flex: 1,
            display: 'block',
            minHeight: 440,
            maxWidth: '50%',
          }}
          className="hidden md:block"
        >
          <img
            src={picture2}
            alt="Delicious Dish"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Right Side: Login Form */}
        <div
          style={{
            flex: 1,
            padding: '48px 44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 34,
              fontWeight: 700,
              textAlign: 'center',
              color: '#1a1a1a',
              margin: '0 0 32px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Login
          </h1>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: 13,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: 13,
                  color: '#666666',
                  fontFamily: "Georgia, serif",
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  color: '#333333',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#f37321')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: 13,
                  color: '#666666',
                  fontFamily: "Georgia, serif",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  color: '#333333',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#f37321')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* Login Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: 10,
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #d95d08',
                background: 'linear-gradient(to right, #f78c1f, #f2721c)',
                color: '#ffffff',
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(243, 115, 33, 0.2)',
                transition: 'opacity 0.15s ease, transform 0.1s ease',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Bottom Register Link */}
          <div
            style={{
              marginTop: 18,
              textAlign: 'right',
            }}
          >
            <Link
              to="/signup"
              id="register-link"
              style={{
                fontSize: 12,
                fontFamily: "Georgia, serif",
                color: '#3b71ca',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              New Here? Register →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
