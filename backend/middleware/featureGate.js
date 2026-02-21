/**
 * Feature Gating Middleware
 * Controls access to features based on subscription tier
 */

const { supabase } = require('../config/database.serverless');

const TIER_LEVELS = {
  free: 0,
  pro: 1,
  premium: 2,
};

/**
 * Check if user has access to a feature
 * @param {string} feature - Feature name (e.g., 'unlimited_quizzes', 'ai_feedback')
 */
exports.checkFeatureAccess = (feature) => {
  return (req, res, next) => {
    const userTier = req.user?.subscription_tier || 'free';
    const tierLevel = TIER_LEVELS[userTier] || 0;

    const featureMatrix = {
      unlimited_quizzes: 1, // Pro+
      unlimited_notes: 1, // Pro+
      variable_questions: 1, // Pro+ (10-30 questions)
      mixed_questions: 1, // Pro+ (MCQ + free-text)
      pre_quiz_teaching: 1, // Pro+
      ai_feedback: 1, // Pro+
      weakness_quizzes: 1, // Pro+
      ai_teaching_chat: 2, // Premium only
    };

    const requiredTier = featureMatrix[feature] || 1;

    if (tierLevel < requiredTier) {
      return res.status(403).json({
        error: 'Feature not available',
        message: `This feature requires ${requiredTier === 2 ? 'Premium' : 'Pro'} subscription`,
        currentTier: userTier,
        requiredTier: requiredTier === 2 ? 'premium' : 'pro',
      });
    }

    next();
  };
};

/**
 * Check quiz generation quota for free users
 * Free tier: 5 quizzes/month
 * Pro/Premium: Unlimited
 */
exports.checkQuizQuota = async (req, res, next) => {
  const userTier = req.user?.subscription_tier || 'free';

  // Pro and Premium have unlimited quizzes
  if (userTier !== 'free') {
    return next();
  }

  try {
    // Check if free user has remaining quizzes for this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { count: quizzesThisMonth, error } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .gte('created_at', monthStart.toISOString());

    if (error) {
      throw new Error(error.message);
    }

    const remainingQuizzes = 5 - (quizzesThisMonth || 0);

    if (remainingQuizzes <= 0) {
      return res.status(429).json({
        error: 'Quiz limit reached',
        message: 'Free users can create 5 quizzes per month. Upgrade to Pro for unlimited quizzes.',
        limit: 5,
        used: quizzesThisMonth,
        reset: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      });
    }

    // Store remaining quizzes for use in controller
    req.remainingQuizzes = remainingQuizzes;
    next();
  } catch (error) {
    console.error('Quiz quota check error:', error);
    next(); // Allow request to proceed on error
  }
};

/**
 * Check note upload limits for free users
 * Free tier: 3 notes maximum
 * Pro/Premium: Unlimited
 */
exports.checkNoteQuota = async (req, res, next) => {
  const userTier = req.user?.subscription_tier || 'free';

  // Pro and Premium have unlimited notes
  if (userTier !== 'free') {
    return next();
  }

  try {
    // Check if free user has reached 3 notes limit
    const { count: noteCount, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (error) {
      throw new Error(error.message);
    }

    const remainingNotes = 3 - (noteCount || 0);

    if (remainingNotes <= 0) {
      return res.status(429).json({
        error: 'Note limit reached',
        message: 'Free users can upload 3 notes. Upgrade to Pro for unlimited notes.',
        limit: 3,
        used: noteCount,
      });
    }

    // Store remaining notes for use in controller
    req.remainingNotes = remainingNotes;
    next();
  } catch (error) {
    console.error('Note quota check error:', error);
    next(); // Allow request to proceed on error
  }
};

/**
 * Enforce question count limits by tier
 * Free: 10 fixed questions (MCQ only)
 * Pro/Premium: 10-30 variable questions (AI decides)
 */
exports.enforceQuestionLimits = (req, res, next) => {
  const userTier = req.user?.subscription_tier || 'free';
  const { questionCount } = req.body;

  if (userTier === 'free') {
    // Free tier: always 10 questions
    req.body.questionCount = 10;
    req.body.questionType = 'mcq_only'; // Only MCQ
  } else {
    // Pro/Premium: 5-30 variable
    if (questionCount && questionCount < 5) {
      req.body.questionCount = 5;
    } else if (questionCount && questionCount > 30) {
      req.body.questionCount = 30;
    }
    // AI will decide mix of MCQ + free-text
  }

  next();
};

/**
 * Get tier info for response headers
 */
exports.getTierInfo = (req, res, next) => {
  const userTier = req.user?.subscription_tier || 'free';
  const tierLevel = TIER_LEVELS[userTier] || 0;

  res.locals.userTier = userTier;
  res.locals.tierLevel = tierLevel;

  next();
};
