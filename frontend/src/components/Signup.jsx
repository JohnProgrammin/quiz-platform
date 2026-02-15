import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signup } from '../api';

function Signup({ onLogin }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signup(formData);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="border-b-2 border-border bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate hover:text-ink transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">{t('common.back')}</span>
          </Link>
          <span className="text-2xl font-extrabold text-brand-500 tracking-tight">floraquiz</span>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-extrabold text-ink text-center mb-2">{t('auth.createProfile')}</h1>
          <p className="text-slate text-center mb-8 font-semibold">{t('auth.startLearning')}</p>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border-2 border-danger rounded-2xl text-danger font-bold text-sm text-center"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Signup form">
            <div>
              <label htmlFor="signup-username" className="sr-only">{t('auth.username')}</label>
              <input
                id="signup-username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field"
                placeholder={t('auth.username')}
                aria-label="Username"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="sr-only">{t('auth.email')}</label>
              <input
                id="signup-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder={t('auth.email')}
                aria-label="Email address"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="signup-fullname" className="sr-only">{t('auth.fullName')}</label>
              <input
                id="signup-fullname"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field"
                placeholder={t('auth.fullNameOptional')}
                aria-label="Full name"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="sr-only">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder={t('auth.password')}
                  aria-label="Password"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
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
              className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? t('auth.creatingAccount') : t('auth.createAccount').toUpperCase()}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-border text-center">
            <p className="text-slate font-semibold">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-brand-500 font-bold hover:underline">
                {t('auth.login').toUpperCase()}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
