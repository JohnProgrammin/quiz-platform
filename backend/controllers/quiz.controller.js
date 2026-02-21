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
    const language = req.headers['accept-language'] || 'en';
    const { noteId, noteIds, questionCount, difficulty, questionType } = req.body;

    // Support both single noteId and array of noteIds
    let idsToFetch = [];
    if (noteIds && Array.isArray(noteIds) && noteIds.length > 0) {
      idsToFetch = noteIds;
    } else if (noteId) {
      idsToFetch = [noteId];
    }

    console.log(`  User: ${userId}, Tier: ${userTier}, NoteIds: ${idsToFetch.join(', ')}`);

    if (idsToFetch.length === 0) {
      return res.status(400).json({ error: 'noteId or noteIds array is required' });
    }

    if (idsToFetch.length > 1 && userTier === 'free') {
      return res.status(403).json({ error: 'Compound quizzes (multiple notes) require a Pro or Premium subscription.' });
    }

    console.log('  ✓ Note validation passed');

    // Verify notes belong to user and get content
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, content')
      .in('id', idsToFetch)
      .eq('user_id', userId);

    if (notesError || !notes || notes.length === 0) {
      return res.status(404).json({ error: 'Notes not found' });
    }

    const quizId = uuidv4();

    // Combine content
    let combinedContent = '';
    let quizTitle = '';

    if (notes.length === 1) {
      combinedContent = notes[0].content;
      quizTitle = 'Quiz from ' + (notes[0].title || notes[0].id);
    } else {
      combinedContent = notes.map(n => `--- Source: ${n.title || n.id} ---\n${n.content}`).join('\n\n');
      quizTitle = `Compound Quiz from ${notes.length} notes`;
    }

    // Generate questions using AI
    console.log('  ✓ Notes retrieved');
    const contentLength = combinedContent.length || 0;
    console.log(`  Note content length: ${contentLength} characters`);

    const finalQuestionCount = questionCount || (userTier === 'free' ? 10 : 15);
    console.log(`  Calling AI service to generate ${finalQuestionCount} questions...`);

    let finalDifficulty = 'standard';
    let finalQuestionType = 'mixed';

    // Only Premium users can use custom settings
    if (userTier === 'premium') {
      finalDifficulty = difficulty || 'standard';
      finalQuestionType = questionType || 'mixed';
    }

    const questions = await aiService.generateQuizQuestions(
      combinedContent,
      finalQuestionCount,
      userTier,
      language,
      finalDifficulty,
      finalQuestionType
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

    // ── DB Insert ────────────────────────────────────────────────────────────
    const insertPayload = {
      id: quizId,
      user_id: userId,
      note_id: idsToFetch.length === 1 ? idsToFetch[0] : null,
      title: quizTitle,
      created_at: new Date(),
      ai_generation_metadata: { noteIds: idsToFetch }
    };

    // Try to store questions/count — OK if columns don't exist yet
    try {
      const { error: quizError } = await supabase
        .from('quizzes')
        .insert([{ ...insertPayload, questions, question_count: questions.length }])
        .select('id')
        .single();

      if (quizError) {
        // Columns likely missing — fall back to minimal insert
        console.warn('⚠️ Quiz insert with questions failed, trying minimal insert:', quizError.message);
        const { error: fallbackError } = await supabase
          .from('quizzes')
          .insert([insertPayload]);
        if (fallbackError) {
          console.error('❌ Quiz INSERT failed (fallback):', fallbackError);
          return res.status(500).json({ error: 'Failed to save quiz to database' });
        }
      }
    } catch (insertErr) {
      console.error('❌ Quiz INSERT exception:', insertErr);
      return res.status(500).json({ error: 'Failed to save quiz to database' });
    }

    console.log(`✅ Quiz saved to database: ${quizId}`);

    res.status(201).json({
      id: quizId,
      questionCount: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text || q.question,
        type: q.type,
        options: q.type === 'mcq' ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        sampleAnswer: q.sampleAnswer,
        keywords: q.keywords,
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
      // Select questions column only if it exists — fallback handled below
      .select('id, title, questions, question_count, created_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST204 = column not in schema cache; still return the row without questions
      if (error.code === 'PGRST204') {
        const { data: quizMin, error: minErr } = await supabase
          .from('quizzes')
          .select('id, title, created_at')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        if (minErr || !quizMin) return res.status(404).json({ error: 'Quiz not found' });
        return res.json({ data: { ...quizMin, questions: [], question_count: 0 } });
      }
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

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
          sampleAnswer: q.sampleAnswer,
          keywords: q.keywords || [],
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
      const userName = req.user?.fullName?.split(' ')[0] || req.user?.username || 'there';
      aiFeedback = await aiService.generateQuizFeedback(
        '', // noteContent — not available in results endpoint
        questions,
        gradedAnswers,
        userName
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
        quiz_id,
        percentage,
        score,
        total_questions,
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
      quizId: attempt.quiz_id,
      quizTitle: attempt.quizzes?.title || 'Unknown Quiz',
      percentage: attempt.percentage,
      score: attempt.score,
      totalQuestions: attempt.total_questions,
      completedAt: attempt.completed_at,
      completed_at: attempt.completed_at,
    }));

    res.json({ data: formatted });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

/**
 * Generate Daily Review Quiz (Spaced Repetition)
 * Finds recent weak topics and generates a mastery quiz
 */
exports.getDailyReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTier = req.user?.subscription_tier || 'free';

    // Pro+ feature only
    if (userTier === 'free') {
      return res.status(403).json({ error: 'Daily Review is a Pro feature.' });
    }

    // 1. Find recent weak topics from quiz attempts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('quiz_id, weak_topics, quizzes(questions)')
      .eq('user_id', userId)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .order('completed_at', { ascending: false });

    if (error) throw error;

    let allWeakTopics = new Set();
    let allQuestions = [];

    (attempts || []).forEach(attempt => {
      if (attempt.weak_topics && attempt.weak_topics.length > 0) {
        attempt.weak_topics.forEach(t => allWeakTopics.add(t));
      }

      if (attempt.quizzes && attempt.quizzes.questions) {
        let qList = attempt.quizzes.questions;
        if (typeof qList === 'string') qList = JSON.parse(qList);
        if (Array.isArray(qList)) allQuestions = allQuestions.concat(qList);
      }
    });

    const weakTopicsArray = Array.from(allWeakTopics).slice(0, 5); // Take top 5

    if (weakTopicsArray.length === 0) {
      return res.json({ message: 'No weak topics found for review. Great job!', data: null });
    }

    const reviewQuizId = uuidv4();

    // Provide a sample of past questions safely as context
    const recentQuestionsSample = allQuestions.slice(0, 30).map(q => q.question || q.text).join('\n---\n');

    const questions = await aiService.generateWeaknessMasteryQuiz(
      weakTopicsArray.join(', '),
      recentQuestionsSample || 'General knowledge'
    );

    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'Failed to generate review questions' });
    }

    questions.forEach((q, i) => { if (!q.id) q.id = `q_rev_${i + 1}`; });

    const insertPayload = {
      id: reviewQuizId,
      user_id: userId,
      title: 'Daily Review: ' + new Date().toLocaleDateString(),
      created_at: new Date(),
      ai_generation_metadata: { type: 'daily_review', topics: weakTopicsArray }
    };

    const { error: quizError } = await supabase
      .from('quizzes')
      .insert([{ ...insertPayload, questions, question_count: questions.length }]);

    if (quizError) throw quizError;

    res.status(201).json({
      id: reviewQuizId,
      title: insertPayload.title,
      topics: weakTopicsArray,
      questionCount: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text || q.question,
        type: q.type,
        options: q.type === 'mcq' ? q.options : undefined,
      })),
    });
  } catch (error) {
    console.error('Get daily review error:', error);
    res.status(500).json({ error: 'Failed to generate daily review' });
  }
};

