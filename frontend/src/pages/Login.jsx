import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button, PageTransition } from '../components';
import { SEO } from '../components/SEO';
import { login } from '../api';
import { Email, Lock, Error } from '@mui/icons-material';
import AnimatedDots from '../components/AnimatedDots';

/**
 * Login Page
 * Beautiful login form with animations
 */
export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password, username: email });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      // Provide user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Account not found. Please sign up first.';
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <SEO title="Login to FloraQuiz | Access Your Dashboard" description="Sign in to your FloraQuiz account to continue your learning journey." />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo/Branding */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-ink tracking-tight">FloraQuiz</h1>
            <p className="text-slate font-bold mt-2">Welcome back! Keep up the momentum.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-200 border-b-[6px] border-b-slate-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-black text-ink mb-2 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Email className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 transition-colors outline-none font-medium"
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
                disabled={loading}
                className="w-full py-4 mt-2 rounded-2xl font-black text-lg bg-brand-500 text-white shadow-btn-brand active:shadow-none active:translate-y-1 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? <AnimatedDots text="Signing In" /> : 'Sign In'}
              </button>
            </form>

            {/* Sign Up Link */}
            <Link
              to="/signup"
              className="w-full py-4 rounded-b-2xl bg-slate-100 border-2 border-t-0 border-slate-200 text-slate-700 font-black hover:bg-slate-200 transition-colors text-center block active:shadow-none active:translate-y-[2px] -mt-2"
            >
              Create an Account
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-sm font-bold text-slate mt-8">
            By signing in, you agree to our{' '}
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

export default Login;
