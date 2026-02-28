const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  checkFeatureAccess,
  checkQuizQuota,
  enforceQuestionLimits,
} = require('../middleware/featureGate');
const quizController = require('../controllers/quiz.controller');

const router = express.Router();

/**
 * Quiz Routes
 * Base: /api/v1/quiz
 */

// Generate a new quiz from notes
router.post(
  '/generate',
  authenticateToken,
  checkQuizQuota,
  enforceQuestionLimits,
  quizController.generateQuiz
);

// Get all quizzes for user
router.get('/', authenticateToken, quizController.getQuizzes);

// Get daily review (Spaced Repetition)
router.get('/daily-review', authenticateToken, quizController.getDailyReview);

// Get specific quiz details
router.get('/:id', authenticateToken, quizController.getQuiz);

// Submit quiz answers and get immediate grading
router.post('/:id/submit', authenticateToken, quizController.submitQuiz);

// Get quiz results with AI feedback (Pro+ only)
router.get(
  '/:id/results/:attemptId',
  authenticateToken,
  checkFeatureAccess('ai_feedback'),
  quizController.getResults
);

// Get all attempts for a quiz
router.get('/:id/attempts', authenticateToken, quizController.getAttempts);

// Get quiz history
router.get('/history/all', authenticateToken, quizController.getHistory);

// Generate mastery quiz from weak topics (Pro+ only)
router.post(
  '/:attemptId/mastery',
  authenticateToken,
  checkFeatureAccess('mastery_quizzes'),
  quizController.generateMasteryQuiz
);

module.exports = router;
