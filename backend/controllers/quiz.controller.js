const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/database.serverless');
const aiService = require('../services/ai.service');
const quizService = require('../services/quiz.service');

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
    const noteResult = await sql`
      SELECT id, content FROM notes WHERE id = ${noteId} AND user_id = ${userId}
    `;

    if (noteResult.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = noteResult[0];
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

    console.log(`✅ Generated ${questions.length} questions successfully`);

    // Save quiz to database
    const quizResult = await sql`
      INSERT INTO quizzes (id, user_id, note_id, title, questions, question_count, created_at)
      VALUES (${quizId}, ${userId}, ${noteId}, ${'Quiz from ' + note.id}, ${JSON.stringify(questions)}, ${questions.length}, NOW())
      RETURNING *
    `;

    if (!quizResult || quizResult.length === 0) {
      console.error('❌ Quiz INSERT failed - no result returned');
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

    const result = await sql`
      SELECT id, title, question_count, created_at
      FROM quizzes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json(result);
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

    const result = await sql`
      SELECT id, title, questions, question_count, created_at
      FROM quizzes
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = result[0];
    // Handle both JSON string and already-parsed objects
    let questions = quiz.questions;
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    } else if (!Array.isArray(questions)) {
      questions = [];
    }

    res.json({
      ...quiz,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text || q.question, // Handle both field names (text or question)
        type: q.type,
        options: q.type === 'mcq' ? q.options : undefined,
      })),
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
    const quizResult = await sql`
      SELECT id, questions FROM quizzes
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (quizResult.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult[0];
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
      const attemptResult = await sql`
        INSERT INTO quiz_attempts (id, quiz_id, user_id, answers, percentage, score, total_questions, completed_at)
        VALUES (${attemptId}, ${id}, ${userId}, ${JSON.stringify(graded.gradedAnswers)}, ${percentage}, ${graded.correctCount}, ${questions.length}, NOW())
        RETURNING id
      `;

      if (!attemptResult || attemptResult.length === 0) {
        console.error('❌ Quiz attempt INSERT failed - no result returned');
        return res.status(500).json({ error: 'Failed to save quiz attempt - database error' });
      }

      console.log(`✅ Quiz attempt saved: ${attemptId}`);

      res.status(201).json({
        message: 'Quiz submitted successfully',
        data: {
          attemptId: attemptId,
          score: graded.correctCount,
          total: questions.length,
          percentage: percentage,
          gradedAnswers: graded.gradedAnswers,
        },
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
    const attemptResult = await sql`
      SELECT id, quiz_id, answers, percentage, score
      FROM quiz_attempts
      WHERE id = ${attemptId} AND user_id = ${userId}
    `;

    if (attemptResult.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attemptResult[0];
    let gradedAnswers = attempt.answers;
    if (typeof gradedAnswers === 'string') {
      gradedAnswers = JSON.parse(gradedAnswers);
    } else if (!Array.isArray(gradedAnswers)) {
      gradedAnswers = [];
    }

    // Get quiz for AI feedback
    const quizResult = await sql`
      SELECT questions FROM quizzes WHERE id = ${id}
    `;

    let questions = quizResult[0].questions;
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

    const result = await sql`
      SELECT
        id,
        quiz_id,
        score,
        total_questions,
        percentage,
        completed_at,
        time_spent_seconds
      FROM quiz_attempts
      WHERE quiz_id = ${id} AND user_id = ${userId}
      ORDER BY completed_at DESC
    `;

    res.json({ data: result });
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

    const result = await sql`
      SELECT qa.id, q.title, qa.percentage, qa.score, qa.created_at
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ${userId}
      ORDER BY qa.created_at DESC
      LIMIT 50
    `;

    res.json(result);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};
