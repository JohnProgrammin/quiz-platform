import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button, PageTransition } from '../components';
import { auth } from '../services/api';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react';

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
      await auth.signup(formData.email, formData.password, formData.username);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Logo/Branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2 }} className="text-5xl mb-3">
              🚀
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900">Join FloraQuiz</h1>
            <p className="text-gray-600 mt-2">Start your learning journey today</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="your username"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    required
                  />
                </div>

                {/* Password Strength Indicator */}
                <motion.div className="mt-3 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <div className="space-y-2">
                    {[
                      { label: 'At least 8 characters', check: passwordStrength.length },
                      { label: 'Uppercase letter (A-Z)', check: passwordStrength.hasUpper },
                      { label: 'Lowercase letter (a-z)', check: passwordStrength.hasLower },
                      { label: 'Number (0-9)', check: passwordStrength.hasNumber },
                    ].map((req) => (
                      <motion.div
                        key={req.label}
                        className={`flex items-center gap-2 text-xs ${req.check ? 'text-green-600' : 'text-gray-500'}`}
                        whileHover={{ x: 5 }}
                      >
                        {req.check ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300" />
                        )}
                        {req.label}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all outline-none ${
                      formData.confirmPassword
                        ? formData.confirmPassword === formData.password
                          ? 'border-green-300 focus:ring-2 focus:ring-green-200'
                          : 'border-red-300 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                    }`}
                    required
                  />
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading || !isPasswordValid}
                >
                  Create Account
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">Already have an account?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Login Link */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <Link
                to="/login"
                className="w-full py-2 rounded-lg bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-center block"
              >
                Sign In Instead
              </Link>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-sm text-gray-600 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            By signing up, you agree to our{' '}
            <a href="#" className="text-purple-600 hover:underline">
              Terms of Service
            </a>
          </motion.p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Signup;
