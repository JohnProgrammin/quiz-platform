const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/ai.service');
const { supabase } = require('../config/database.serverless');

/**
 * Create a new teaching session
 * Initializes a conversation with the AI tutor
 */
exports.createSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, noteId } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const sessionId = uuidv4();

    const { data: sessions, error } = await supabase
      .from('teaching_sessions')
      .insert([{
        id: sessionId,
        user_id: userId,
        topic: topic,
        note_id: noteId || null,
        conversation_history: []
      }])
      .select();

    if (error || !sessions || sessions.length === 0) {
      throw new Error(error?.message || 'Failed to create session');
    }

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
    const userId = req.user.id;

    const { data: sessions, error } = await supabase
      .from('teaching_sessions')
      .select('id, topic, note_id, message_count, session_status, created_at, last_message_at')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json({ data: sessions || [] });
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
    const userId = req.user.id;
    const { id } = req.params;

    const { data: sessions, error } = await supabase
      .from('teaching_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId);

    if (error || !sessions || sessions.length === 0) {
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
    const { data: sessions, error: sessionError } = await supabase
      .from('teaching_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId);

    if (sessionError || !sessions || sessions.length === 0) {
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

    // Session message limit: 100 for free/pro, 2000 for Premium
    const userTier = req.user?.subscription_tier || 'free';
    const maxMessages = userTier === 'premium' ? 2000 : 100;

    if (history.length >= maxMessages) {
      return res.status(429).json({
        error: 'Session limit reached',
        message: `This session has reached ${maxMessages} messages. Please start a new session.`,
        limit: maxMessages
      });
    }

    // 3. Get note content if linked
    let noteContent = '';
    if (session.note_id) {
      const { data: notes, error: noteError } = await supabase
        .from('notes')
        .select('content')
        .eq('id', session.note_id);

      if (!noteError && notes && notes.length > 0) {
        noteContent = notes[0].content || '';
      }
    }

    // 4. Call AI service
    const userName = req.user?.fullName?.split(' ')[0] || req.user?.username || 'there';
    const aiResponse = await aiService.teachingConversation(
      session.topic,
      message.trim(),
      history,
      noteContent,
      userName
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
    const { error: updateError } = await supabase
      .from('teaching_sessions')
      .update({
        conversation_history: updatedHistory,
        message_count: updatedHistory.length,
        tokens_used: (session.tokens_used || 0) + estimatedTokens,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw new Error(updateError.message);
    }

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
    const { supabase } = require('../config/database.serverless');
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

    const { data: result, error } = await supabase
      .from('teaching_sessions')
      .update({
        session_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, session_status');

    if (error || !result || result.length === 0) {
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
