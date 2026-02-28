import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button, PageTransition } from '../components';
import { SEO } from '../components/SEO';
import { signup } from '../api';
import { Email, Lock, Person, Error, CheckCircle } from '@mui/icons-material';
import AnimatedDots from '../components/AnimatedDots';

/**
 * Signup Page
 * Create new account with validation
 */
export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const isPasswordValid =
    Object.values(passwordStrength).every(Boolean) && formData.confirmPassword === formData.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await signup({ email: formData.email, password: formData.password, username: formData.username, fullName: formData.fullName });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid information provided. Please check and try again.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Email or username already exists. Please try another.';
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <SEO title="Join FloraQuiz | Free AI Quiz Generator" description="Create a free FloraQuiz account and generate AI quizzes from your study notes in seconds." />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo/Branding */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-ink tracking-tight">Join FloraQuiz</h1>
            <p className="text-slate font-bold mt-2">Start your learning journey today.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 border-b-[6px] border-b-slate-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-black text-ink mb-2 uppercase tracking-wide">Username</label>
                <div className="relative">
                  <Person className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="your username"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 transition-colors outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-black text-ink mb-2 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Email className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 transition-colors outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-black text-ink mb-2 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 transition-colors outline-none font-medium"
                    required
                  />
                </div>

                {/* Password Strength Indicator */}
                <div className="mt-4 space-y-2 px-1">
                  {[
                    { label: 'At least 8 characters', check: passwordStrength.length },
                    { label: 'Uppercase letter (A-Z)', check: passwordStrength.hasUpper },
                    { label: 'Lowercase letter (a-z)', check: passwordStrength.hasLower },
                    { label: 'Number (0-9)', check: passwordStrength.hasNumber },
                  ].map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs font-bold ${req.check ? 'text-green-500' : 'text-slate-400'}`}
                    >
                      {req.check ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      )}
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-black text-ink mb-2 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 transition-colors outline-none font-medium ${formData.confirmPassword
                      ? formData.confirmPassword === formData.password
                        ? 'border-green-400 bg-green-50 focus:border-green-500'
                        : 'border-red-400 bg-red-50 focus:border-red-500'
                      : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-2 p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                  <Error className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full py-4 mt-2 rounded-2xl font-black text-lg bg-brand-500 text-white shadow-btn-brand active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <AnimatedDots text="Creating" /> : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <Link
              to="/login"
              className="w-full py-4 rounded-b-2xl border-t-0 -mt-2 bg-slate-100 border-2 border-slate-200 text-slate-700 font-black hover:bg-slate-200 transition-colors text-center block shadow-card active:shadow-none active:translate-y-[2px]"
            >
              Sign In Instead
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-sm font-bold text-slate mt-8">
            By signing up, you agree to our{' '}
            <a href="#" className="text-brand-500 hover:text-brand-600">
              Terms of Service
            </a>
          </p>

          <div className="mt-8 text-center">
            <Link to="/" className="text-brand-500 font-bold hover:text-brand-400">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Signup;
