const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/database.serverless');
const aiService = require('../services/ai.service');
const quizService = require('../services/quiz.service');
const gamificationService = require('../services/gamification.service');

/**
 * Generate a new quiz from notes
 */
exports.generateQuiz = async (req, res) => {
  try {
    console.log('\n🔵 generateQuiz called');
    const userId = req.user.id;
    const userTier = req.user?.subscription_tier || 'free';
    const { noteId, questionCount } = req.body;

    console.log(`  User: ${userId}, Tier: ${userTier}, NoteId: ${noteId}`);

    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' });
    }

    console.log('  ✓ NoteId validation passed');

    // Verify note belongs to user
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('id, content')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (noteError || !note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const quizId = uuidv4();

    // Generate questions using AI
    console.log('  ✓ Note retrieved');
    const contentLength = note.content?.length || 0;
    console.log(`  Note content length: ${contentLength} characters`);

    const finalQuestionCount = questionCount || (userTier === 'free' ? 10 : 15);
    console.log(`  Calling AI service to generate ${finalQuestionCount} questions...`);

    const questions = await aiService.generateQuizQuestions(
      note.content,
      finalQuestionCount,
      userTier
    );

    console.log(`  ✓ AI generated ${questions?.length || 0} questions`);

    if (!questions || questions.length === 0) {
      console.error('Quiz generation returned empty questions');
      return res.status(400).json({ error: 'Failed to generate quiz questions' });
    }

    // Assign unique IDs to AI-generated questions
    questions.forEach((q, i) => {
      if (!q.id) q.id = `q_${i + 1}`;
    });

    console.log(`✅ Generated ${questions.length} questions successfully`);

    // Save quiz to database
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        id: quizId,
        user_id: userId,
        note_id: noteId,
        title: 'Quiz from ' + note.id,
        questions: questions,
        question_count: questions.length,
        created_at: new Date(),
      }])
      .select('*')
      .single();

    if (quizError || !quizData) {
      console.error('❌ Quiz INSERT failed:', quizError);
      return res.status(500).json({ error: 'Failed to save quiz to database' });
    }

    console.log(`✅ Quiz saved to database: ${quizId}`);

    res.status(201).json({
      id: quizId,
      questionCount: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text || q.question, // Handle both field names (text or question)
        type: q.type,
        options: q.type === 'mcq' ? q.options : undefined,
      })),
    });
  } catch (error) {
    console.error('Generate quiz error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: `Failed to generate quiz: ${error.message}` });
  }
};

/**
 * Get all quizzes for user
 */
exports.getQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, question_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ data: data || [] });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
};

/**
 * Get specific quiz
 */
exports.getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('id, title, questions, question_count, created_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Handle both JSON string and already-parsed objects
    let questions = quiz.questions;
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    } else if (!Array.isArray(questions)) {
      questions = [];
    }

    res.json({
      data: {
        ...quiz,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question || q.text, // Normalize to 'question' field
          text: q.text || q.question, // Also keep text for compatibility
          type: q.type || 'mcq',
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer,
          explanation: q.explanation || '',
        })),
      },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
};

/**
 * Submit quiz answers and grade
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userTier = req.user?.subscription_tier || 'free';
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    // Get quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, questions')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let questions = quiz.questions;
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    } else if (!Array.isArray(questions)) {
      questions = [];
    }

    // Grade answers
    const graded = await quizService.gradeAnswers(
      questions,
      answers,
      userTier
    );

    const attemptId = uuidv4();
    const percentage = Math.round((graded.correctCount / questions.length) * 100);

    // Save attempt to database
    try {
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert([{
          id: attemptId,
          quiz_id: id,
          user_id: userId,
          answers: graded.gradedAnswers,
          percentage: percentage,
          score: graded.correctCount,
          total_questions: questions.length,
          completed_at: new Date(),
        }])
        .select('id')
        .single();

      if (attemptError || !attemptData) {
        console.error('❌ Quiz attempt INSERT failed:', attemptError);
        return res.status(500).json({ error: 'Failed to save quiz attempt - database error' });
      }

      console.log(`✅ Quiz attempt saved: ${attemptId}`);

      // Award gamification XP
      let gamificationData = null;
      try {
        let xpAwarded = gamificationService.XP_REWARDS.QUIZ_COMPLETE;
        if (percentage === 100) {
          xpAwarded += gamificationService.XP_REWARDS.PERFECT_SCORE;
          await gamificationService.checkAchievement(userId, 'perfect_score', { quizId: id, percentage });
        } else if (percentage >= 80) {
          xpAwarded += gamificationService.XP_REWARDS.GOOD_SCORE;
        }

        const xpResult = await gamificationService.awardXP(userId, xpAwarded, 'Quiz completion', {
          quizId: id,
          percentage,
          attemptId,
        });

        // Update streak
        const newStreak = await gamificationService.updateStreak(userId);

        // Check first quiz achievement
        if (graded.correctCount > 0) {
          await gamificationService.checkAchievement(userId, 'first_quiz', { quizId: id });
        }

        // Check quiz completion count achievements
        const { count: attemptCount, error: countError } = await supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (attemptCount === 10) {
          await gamificationService.checkAchievement(userId, 'quiz_10', { totalAttempts: 10 });
        } else if (attemptCount === 50) {
          await gamificationService.checkAchievement(userId, 'quiz_50', { totalAttempts: 50 });
        } else if (attemptCount === 100) {
          await gamificationService.checkAchievement(userId, 'quiz_100', { totalAttempts: 100 });
        }

        gamificationData = {
          xpAwarded: xpResult.xpAwarded,
          leveledUp: xpResult.leveledUp,
          newLevel: xpResult.newLevel,
          currentStreak: newStreak,
          nextLevelXP: xpResult.nextLevelXP,
          progressToNextLevel: xpResult.currentProgress,
        };
      } catch (gamErr) {
        console.error('⚠️ Error awarding gamification:', gamErr.message);
        // Don't fail the quiz submission, gamification is bonus
      }

      res.status(201).json({
        message: 'Quiz submitted successfully',
        data: {
          attemptId: attemptId,
          score: graded.correctCount,
          total: questions.length,
          percentage: percentage,
          gradedAnswers: graded.gradedAnswers,
        },
        gamification: gamificationData,
      });
    } catch (dbError) {
      console.error('❌ Database error saving quiz attempt:', dbError.message);
      console.error('   Error details:', dbError);
      res.status(500).json({ error: `Failed to save quiz attempt: ${dbError.message}` });
    }
  } catch (error) {
    console.error('❌ Submit quiz error:', error.message);
    console.error('   Error details:', error);
    res.status(500).json({ error: `Failed to submit quiz: ${error.message}` });
  }
};

/**
 * Get quiz results with AI feedback (Pro+ only)
 */
exports.getResults = async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const userId = req.user.id;
    const userTier = req.user?.subscription_tier || 'free';

    // Get attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('id, quiz_id, answers, percentage, score')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (attemptError || !attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    let gradedAnswers = attempt.answers;
    if (typeof gradedAnswers === 'string') {
      gradedAnswers = JSON.parse(gradedAnswers);
    } else if (!Array.isArray(gradedAnswers)) {
      gradedAnswers = [];
    }

    // Get quiz for AI feedback
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('questions')
      .eq('id', id)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let questions = quizData.questions;
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    } else if (!Array.isArray(questions)) {
      questions = [];
    }

    // Generate AI feedback for Pro+ users
    let aiFeedback = null;
    let weakTopics = [];

    if (userTier !== 'free') {
      aiFeedback = await aiService.generateQuizFeedback(
        '', // noteContent — not available in results endpoint
        questions,
        gradedAnswers
      );

      // Extract weak topics from feedback
      weakTopics = aiFeedback.weakTopics || [];
    }

    res.json({
      data: {
        attemptId: attemptId,
        score: attempt.score,
        percentage: attempt.percentage,
        gradedAnswers: gradedAnswers,
        aiFeedback: userTier !== 'free' ? aiFeedback : null,
        weakTopics: weakTopics,
      },
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
};

/**
 * Get all attempts for a specific quiz
 */
exports.getAttempts = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id, quiz_id, score, total_questions, percentage, answers, completed_at, time_spent_seconds')
      .eq('quiz_id', id)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    // Ensure consistent field naming for frontend
    const normalizedResults = (data || []).map(attempt => ({
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      score: attempt.score,
      total_questions: attempt.total_questions,
      percentage: attempt.percentage || Math.round((attempt.score / attempt.total_questions) * 100),
      answers: attempt.answers || [],
      completed_at: attempt.completed_at,
      completedAt: attempt.completed_at, // Alias for compatibility
      time_spent_seconds: attempt.time_spent_seconds,
    }));

    res.json({ data: normalizedResults });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to get quiz attempts' });
  }
};

/**
 * Get quiz history
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        id,
        percentage,
        score,
        completed_at,
        quizzes (title)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Format response to match expected structure
    const formatted = (data || []).map(attempt => ({
      id: attempt.id,
      title: attempt.quizzes?.title || 'Unknown Quiz',
      percentage: attempt.percentage,
      score: attempt.score,
      completed_at: attempt.completed_at,
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};
