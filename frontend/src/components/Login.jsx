import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { login } from '../api';

function Login({ onLogin }) {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate hover:text-ink transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">{t('common.back')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-lg font-black text-white">Q</span>
            </div>
            <span className="text-2xl font-black text-ink tracking-tight hidden sm:inline">floraquiz</span>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-black text-ink text-center mb-2">{t('auth.login')}</h1>
          <p className="text-slate text-center mb-8 font-semibold text-lg">{t('auth.welcomeBack')}</p>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-danger font-bold text-sm text-center"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            <div>
              <label htmlFor="username-input" className="sr-only">{t('auth.usernameOrEmail')}</label>
              <input
                id="username-input"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition-colors font-semibold placeholder-gray-500 bg-white"
                placeholder={t('auth.usernameOrEmail')}
                aria-label="Username or email address"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password-input" className="sr-only">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none transition-colors font-semibold placeholder-gray-500 bg-white pr-12"
                  placeholder={t('auth.password')}
                  aria-label="Password"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink transition-colors"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
              className="w-full px-6 py-3 bg-brand-500 text-white font-black rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-lg"
              aria-busy={loading}
            >
              {loading ? t('auth.loggingIn') : t('auth.login').toUpperCase()}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-slate font-semibold">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/signup" className="text-brand-500 font-black hover:underline">
                {t('auth.signup').toUpperCase()}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
