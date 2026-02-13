import axios from 'axios';
import logger from './utils/logger';

/**
 * Determine API URL from environment or window location
 * Priority: VITE_API_URL env var > window.APP_CONFIG.API_URL > relative /api
 */
function getApiUrl() {
  // Check Vite environment variables (import.meta.env is available)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Check window config (can be set by HTML or deployment script)
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_URL) {
    return window.APP_CONFIG.API_URL;
  }

  // Check localStorage for API URL override (useful for development)
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('API_URL_OVERRIDE');
    if (stored) {
      console.log('[API] Using API URL override:', stored);
      return stored;
    }
  }

  // Default: use relative path (works for same-origin requests)
  return '/api';
}

const API_URL = getApiUrl();

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('[API Config]', {
    url: API_URL,
    env: import.meta.env.VITE_API_URL ? 'VITE_API_URL' : 'default',
  });
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout for all requests
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // For FormData, don't set Content-Type (let axios/browser set it automatically with boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  config.metadata = { startTime: new Date() };
  return config;
});

// Log responses and errors
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    logger.logAPICall(
      response.config.method.toUpperCase(),
      response.config.url,
      response.status,
      duration
    );
    return response;
  },
  (error) => {
    const duration = new Date() - error.config.metadata.startTime;
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('[API Error] Request timeout:', error.config.url);
    }

    // Handle network errors
    if (!error.response) {
      console.error('[API Error] Network error:', error.message);
      console.error('[API Error] API URL:', API_URL);
    }

    logger.logAPICall(
      error.config.method.toUpperCase(),
      error.config.url,
      error.response?.status || 'unknown',
      duration,
      error.response?.data?.error || error.message
    );
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => api.post('/api/v1/auth/signup', data);
export const login = (data) => api.post('/api/v1/auth/login', data);
export const logout = () => api.post('/api/v1/auth/logout');
export const sendVerificationEmail = (email) => api.post('/api/v1/auth/send-verification-email', { email });
export const verifyEmail = (token) => api.post('/api/v1/auth/verify-email', { token });

// Profile
export const getProfile = () => api.get('/api/v1/users/me');
export const updateProfile = (data) => api.patch('/api/v1/users/me', data);

// Notes
export const uploadNote = (formData) => api.post('/api/v1/notes', formData);
export const getNotes = () => api.get('/api/v1/notes');
export const getNote = (id) => api.get(`/api/v1/notes/${id}`);
export const deleteNote = (id) => api.delete(`/api/v1/notes/${id}`);

// Quizzes
export const generateQuiz = (data) => api.post('/api/v1/quiz/generate', data);
export const getQuizzes = () => api.get('/api/v1/quiz');
export const getQuiz = (id) => api.get(`/api/v1/quiz/${id}`);
export const submitQuiz = (id, answers) => api.post(`/api/v1/quiz/${id}/submit`, { answers });
export const getQuizResults = (quizId, attemptId) => api.get(`/api/v1/quiz/${quizId}/results/${attemptId}`);
export const getQuizHistory = () => api.get('/api/v1/quiz/history/all');
export const getAllAttempts = () => api.get('/api/v1/quiz/attempts/all');
export const getQuizAttempts = (quizId) => api.get(`/api/v1/quiz/${quizId}/attempts`);

// Teaching (Pre-Quiz & Weakness Quizzes)
export const getPreQuizSummary = (noteId) => api.post('/api/v1/teaching/pre-quiz-summary', { noteId });
export const generateWeaknessQuiz = (attemptId, weakTopics) =>
  api.post('/api/v1/teaching/weakness-quiz', { attemptId, weakTopics });

// AI Teaching Chat (Premium only)
export const createTeachingSession = (topic, noteId = null) =>
  api.post('/api/v1/teaching/sessions', { topic, noteId });
export const getTeachingSessions = () =>
  api.get('/api/v1/teaching/sessions');
export const getTeachingSession = (sessionId) =>
  api.get(`/api/v1/teaching/sessions/${sessionId}`);
export const sendTeachingMessage = (sessionId, message) =>
  api.post(`/api/v1/teaching/sessions/${sessionId}/messages`, { message });
export const updateSessionStatus = (sessionId, status) =>
  api.patch(`/api/v1/teaching/sessions/${sessionId}/status`, { status });

// Subscription & Billing
export const getSubscriptionPlans = () => api.get('/api/v1/subscription/plans');
export const createCheckoutSession = (data) => api.post('/api/v1/subscription/checkout', data);
export const getCurrentSubscription = () => api.get('/api/v1/subscription/current');
export const cancelSubscription = () => api.post('/api/v1/subscription/cancel');
export const resumeSubscription = () => api.post('/api/v1/subscription/resume');
export const getSubscriptionManagement = () => api.get('/api/v1/subscription/management');
export const verifyPayment = (reference) => api.get(`/api/v1/subscription/verify-payment?reference=${reference}`);
// Deprecated: Stripe portal endpoint - replaced with getSubscriptionManagement
// Kept as stub for backward compatibility
export const getBillingPortalUrl = () => {
  return Promise.reject(new Error('Billing portal not available with Paystack. Use subscription management features instead.'));
};
export const getBillingHistory = () => api.get('/api/v1/subscription/history');

export default api;
