/**
 * API Configuration
 * Centralized API versioning, deprecation, and feature flags
 */

module.exports = {
  // Current API version
  version: 'v1',

  // API versioning strategy
  versions: {
    v1: {
      released: '2026-01-01',
      status: 'active',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        quiz: '/api/v1/quiz',
        notes: '/api/v1/notes',
        teaching: '/api/v1/teaching',
        subscription: '/api/v1/subscription',
      }
    }
  },

  // Feature flags for gradual rollout
  features: {
    emailVerification: {
      enabled: true,
      rolloutPercentage: 100,
      description: 'Email verification for new signups'
    },
    aiTeaching: {
      enabled: true,
      rolloutPercentage: 100,
      description: 'AI-powered conversational tutoring',
      minTier: 'premium'
    },
    weaknessQuizzes: {
      enabled: true,
      rolloutPercentage: 100,
      description: 'Targeted quizzes for weak topics',
      minTier: 'pro'
    },
    prequizTeaching: {
      enabled: true,
      rolloutPercentage: 100,
      description: 'Pre-quiz teaching summary',
      minTier: 'pro'
    },
    pdfExport: {
      enabled: false,
      rolloutPercentage: 0,
      description: 'Export quiz results as PDF',
      minTier: 'pro',
      eta: '2026-03-01'
    },
    apiAccess: {
      enabled: false,
      rolloutPercentage: 0,
      description: 'Public API access',
      minTier: 'premium',
      eta: '2026-04-01'
    }
  },

  // Rate limiting configuration by endpoint
  rateLimits: {
    auth: {
      login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 per 15 minutes
      signup: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
      resetPassword: { windowMs: 60 * 60 * 1000, max: 3 },
    },
    quiz: {
      generate: { windowMs: 60 * 1000, max: 10, perTier: { free: 1, pro: 10, premium: 20 } },
      submit: { windowMs: 60 * 1000, max: 30 },
    },
    teaching: {
      chat: { windowMs: 60 * 1000, max: 10, perTier: { pro: 5, premium: 20 } },
      sessions: { windowMs: 24 * 60 * 60 * 1000, max: 20, perTier: { premium: 50 } },
    },
    notes: {
      upload: { windowMs: 60 * 60 * 1000, max: 10, perTier: { free: 3, pro: unlimited, premium: unlimited } },
    }
  },

  // Deprecation notices
  deprecations: {
    '/api/v0/*': {
      deprecated: '2025-12-01',
      sunset: '2026-03-01',
      message: 'API v0 is deprecated. Please migrate to v1.'
    }
  },

  // API documentation
  docs: {
    swagger: '/api/docs',
    postman: '/api/postman-collection.json',
    github: 'https://github.com/yourusername/floraquiz/wiki/API'
  }
};
