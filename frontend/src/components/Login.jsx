import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../api';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="border-b-2 border-border bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center">
          <span className="text-2xl font-extrabold gradient-text tracking-tight">floraquiz</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold text-ink text-center mb-2">Log in</h1>
          <p className="text-slate text-center mb-8 font-semibold">Welcome back! Ready to learn?</p>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border-2 border-danger rounded-2xl text-danger font-bold text-sm text-center"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            <div>
              <label htmlFor="username-input" className="sr-only">Username or email</label>
              <input
                id="username-input"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field"
                placeholder="Username or email"
                aria-label="Username or email address"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password-input" className="sr-only">Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder="Password"
                  aria-label="Password"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-border text-center">
            <p className="text-slate font-semibold">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-500 font-bold hover:underline">
                SIGN UP
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
