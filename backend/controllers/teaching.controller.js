const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/ai.service');

/**
 * Get pre-quiz teaching summary
 * Shows AI-generated summary before quiz starts
 */
exports.getPreQuizSummary = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' });
    }

    // Get note
    const notes = await sql`
      SELECT content FROM notes
      WHERE id = ${noteId} AND user_id = ${req.user.id}
    `;

    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = notes[0];

    // Generate teaching summary
    const summary = await aiService.generateTeachingSummary(
      note.content
    );

    res.json({
      data: {
        summary: summary,
      },
    });
  } catch (error) {
    console.error('Get pre-quiz summary error:', error);
    res.status(500).json({ error: 'Failed to generate teaching summary' });
  }
};

/**
 * Generate weakness mastery quiz
 * Creates 5-question quiz focused on weak topics
 */
exports.generateWeaknessMasteryQuiz = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const userId = req.user.id;
    const { attemptId, weakTopics } = req.body;

    if (!attemptId || !weakTopics || weakTopics.length === 0) {
      return res.status(400).json({
        error: 'attemptId and weakTopics array are required',
      });
    }

    // Get original attempt to find the quiz
    const attempts = await sql`
      SELECT quiz_id FROM quiz_attempts
      WHERE id = ${attemptId} AND user_id = ${userId}
    `;

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const quizId = attempts[0].quiz_id;

    // Get quiz content
    const quizzes = await sql`
      SELECT id, questions FROM quizzes
      WHERE id = ${quizId} AND user_id = ${userId}
    `;

    if (quizzes.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = JSON.parse(quizzes[0].questions || '[]');

    // Generate weakness mastery quiz
    const weaknessQuiz = await aiService.generateWeaknessMasteryQuiz(
      questions,
      weakTopics
    );

    if (!weaknessQuiz || weaknessQuiz.length === 0) {
      return res.status(400).json({
        error: 'Failed to generate weakness mastery quiz',
      });
    }

    const weaknessQuizId = uuidv4();

    // Save weakness quiz
    await sql`
      INSERT INTO weakness_quizzes (id, user_id, quiz_attempt_id, topic, questions, created_at)
      VALUES (${weaknessQuizId}, ${userId}, ${attemptId}, ${weakTopics.join(', ')}, ${JSON.stringify(weaknessQuiz)}, NOW())
    `;

    res.status(201).json({
      data: {
        id: weaknessQuizId,
        topic: weakTopics.join(', '),
        questionCount: weaknessQuiz.length,
        questions: weaknessQuiz.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.type === 'mcq' ? q.options : undefined,
        })),
      },
    });
  } catch (error) {
    console.error('Generate weakness quiz error:', error);
    res.status(500).json({ error: 'Failed to generate weakness quiz' });
  }
};

/**
 * Create a new teaching session
 * Initializes a conversation with the AI tutor
 */
exports.createSession = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const userId = req.user.id;
    const { topic, noteId } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const sessionId = uuidv4();

    const sessions = await sql`
      INSERT INTO teaching_sessions (id, user_id, topic, note_id, conversation_history)
      VALUES (${sessionId}, ${userId}, ${topic}, ${noteId || null}, '[]'::jsonb)
      RETURNING *
    `;

    res.status(201).json({
      message: 'Teaching session created',
      data: sessions[0]
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create teaching session' });
  }
};

/**
 * List all teaching sessions for the user
 */
exports.listSessions = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const userId = req.user.id;

    const sessions = await sql`
      SELECT id, topic, note_id, message_count, session_status,
             created_at, last_message_at
      FROM teaching_sessions
      WHERE user_id = ${userId}
      ORDER BY last_message_at DESC
    `;

    res.json({ data: sessions });
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ error: 'Failed to list teaching sessions' });
  }
};

/**
 * Get a specific teaching session with full conversation history
 */
exports.getSession = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const userId = req.user.id;
    const { id } = req.params;

    const sessions = await sql`
      SELECT * FROM teaching_sessions
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[0];

    // Parse JSONB conversation_history
    try {
      session.messages = typeof session.conversation_history === 'string'
        ? JSON.parse(session.conversation_history)
        : session.conversation_history;
    } catch (parseError) {
      console.error('JSONB parse error:', parseError);
      session.messages = [];
    }

    res.json({ data: session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get teaching session' });
  }
};

/**
 * Send a message in a teaching session
 * Calls AI service and saves conversation history
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const userId = req.user.id;
    const { id } = req.params;
    const { message } = req.body;

    // Validation
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Message length limit (5000 chars)
    if (message.length > 5000) {
      return res.status(400).json({
        error: 'Message too long',
        limit: 5000,
        current: message.length
      });
    }

    // 1. Get session
    const sessions = await sql`
      SELECT * FROM teaching_sessions
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[0];

    // Check session is active
    if (session.session_status !== 'active') {
      return res.status(400).json({
        error: 'Session is not active',
        status: session.session_status
      });
    }

    // 2. Parse conversation history
    let history;
    try {
      history = typeof session.conversation_history === 'string'
        ? JSON.parse(session.conversation_history)
        : session.conversation_history;
    } catch (parseError) {
      console.error('JSONB parse error:', parseError);
      history = [];
    }

    // Session message limit (100 messages)
    if (history.length >= 100) {
      return res.status(429).json({
        error: 'Session limit reached',
        message: 'This session has reached 100 messages. Please start a new session.',
        limit: 100
      });
    }

    // 3. Get note content if linked
    let noteContent = '';
    if (session.note_id) {
      const notes = await sql`
        SELECT content FROM notes WHERE id = ${session.note_id}
      `;
      if (notes.length > 0) {
        noteContent = notes[0].content || '';
      }
    }

    // 4. Call AI service
    const aiResponse = await aiService.teachingConversation(
      session.topic,
      message.trim(),
      history,
      noteContent
    );

    // 5. Create message objects
    const userMsg = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };
    const aiMsg = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...history, userMsg, aiMsg];

    // 6. Token tracking (estimate: ~4 chars per token)
    const estimatedTokens = Math.ceil(
      (message.length + aiResponse.length) / 4
    );

    // 7. Update database
    await sql`
      UPDATE teaching_sessions
      SET conversation_history = ${JSON.stringify(updatedHistory)}::jsonb,
          message_count = ${updatedHistory.length},
          tokens_used = tokens_used + ${estimatedTokens},
          last_message_at = NOW(),
          updated_at = NOW()
      WHERE id = ${id}
    `;

    res.json({
      message: 'Message sent successfully',
      data: {
        userMessage: userMsg,
        aiMessage: aiMsg,
        messageCount: updatedHistory.length,
        tokensUsed: (session.tokens_used || 0) + estimatedTokens
      }
    });
  } catch (error) {
    console.error('Send message error:', error);

    // Handle specific AI service errors
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({
        error: 'AI service rate limit reached. Please try again in a moment.'
      });
    }

    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Update session status (soft delete or completion)
 */
exports.updateSessionStatus = async (req, res) => {
  try {
    const { sql } = require('../config/database.serverless');
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'completed', 'abandoned'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses: validStatuses
      });
    }

    const result = await sql`
      UPDATE teaching_sessions
      SET session_status = ${status},
          updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, session_status
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      message: 'Session status updated',
      data: { id: result[0].id, status: result[0].session_status }
    });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ error: 'Failed to update session status' });
  }
};
