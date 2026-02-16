/**
 * API Service Layer
 * Handles all communication with backend
 * Manages authentication, requests, and error handling
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Clear auth token
const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Make API request with auth header
const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// AUTH ENDPOINTS
// ============================================

export const auth = {
  // Sign up
  signup: async (email, password, username) => {
    const data = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    setAuthToken(data.token);
    return data;
  },

  // Login
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  // Logout
  logout: () => {
    clearAuthToken();
  },

  // Get current user
  me: async () => {
    return request('/auth/me');
  },
};

// ============================================
// USER ENDPOINTS
// ============================================

export const users = {
  // Get user profile
  getProfile: async () => {
    return request('/users/profile');
  },

  // Update user profile
  updateProfile: async (data) => {
    return request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Get user stats
  getStats: async () => {
    return request('/users/stats');
  },

  // Get user gamification data
  getGamification: async () => {
    return request('/users/gamification');
  },
};

// ============================================
// QUIZ ENDPOINTS
// ============================================

export const quizzes = {
  // Get all quizzes
  getAll: async () => {
    return request('/quizzes');
  },

  // Get quiz by ID
  getById: async (id) => {
    return request(`/quizzes/${id}`);
  },

  // Create quiz from note
  create: async (noteId, options = {}) => {
    return request('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ noteId, ...options }),
    });
  },

  // Submit quiz attempt
  submitAttempt: async (quizId, answers) => {
    return request(`/quizzes/${quizId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Get quiz results
  getResults: async (quizId) => {
    return request(`/quizzes/${quizId}/results`);
  },

  // Delete quiz
  delete: async (id) => {
    return request(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// NOTES ENDPOINTS
// ============================================

export const notes = {
  // Get all notes
  getAll: async () => {
    return request('/notes');
  },

  // Get note by ID
  getById: async (id) => {
    return request(`/notes/${id}`);
  },

  // Upload note
  upload: async (file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },

  // Delete note
  delete: async (id) => {
    return request(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

export const analytics = {
  // Get dashboard stats
  getDashboard: async () => {
    return request('/analytics/dashboard');
  },

  // Get performance trends
  getPerformance: async (timeRange = 'week') => {
    return request(`/analytics/performance?range=${timeRange}`);
  },

  // Get leaderboard
  getLeaderboard: async (limit = 100) => {
    return request(`/analytics/leaderboard?limit=${limit}`);
  },

  // Get user rank
  getUserRank: async () => {
    return request('/analytics/rank');
  },
};

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

export const gamification = {
  // Get achievements
  getAchievements: async () => {
    return request('/gamification/achievements');
  },

  // Get user achievements
  getUserAchievements: async () => {
    return request('/gamification/achievements/user');
  },
};

// ============================================
// AI TEACHING ENDPOINTS
// ============================================

export const teaching = {
  // Create teaching session
  createSession: async (topic, noteId = null) => {
    return request('/teaching/sessions', {
      method: 'POST',
      body: JSON.stringify({ topic, noteId }),
    });
  },

  // Get session
  getSession: async (id) => {
    return request(`/teaching/sessions/${id}`);
  },

  // Get all sessions
  getAllSessions: async () => {
    return request('/teaching/sessions');
  },

  // Send message to AI teacher
  sendMessage: async (sessionId, message) => {
    return request(`/teaching/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // End session
  endSession: async (sessionId) => {
    return request(`/teaching/sessions/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
  },
};

export default {
  auth,
  users,
  quizzes,
  notes,
  analytics,
  gamification,
  teaching,
};
