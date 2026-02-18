import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import FeatureGate from './FeatureGate';
import UpgradePrompt from './UpgradePrompt';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  createTeachingSession,
  getTeachingSessions,
  getTeachingSession,
  sendTeachingMessage,
  updateSessionStatus,
} from '../api';
import {
  Sparkles,
  Send,
  Loader,
  Plus,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Typing Indicator Component
 */
const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-100" />
    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-200" />
  </div>
);

/**
 * Copy Button Component
 */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-slate hover:text-ink transition-colors"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
};

/**
 * Main AI Teaching Chat Component
 */
function AITeaching({ user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadSessions = async () => {
    try {
      setError(null);
      const response = await getTeachingSessions();
      setSessions(response.data);
      if (response.data.length > 0) {
        await loadSession(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load teaching sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setError(null);
      const response = await getTeachingSession(sessionId);
      setActiveSession(response.data);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load session');
    }
  };

  const handleNewSession = async () => {
    const topic = prompt('What would you like to learn about?');
    if (!topic || !topic.trim()) return;

    try {
      setError(null);
      const response = await createTeachingSession(topic.trim());
      const newSession = response.data;
      setSessions([newSession, ...sessions]);
      setActiveSession(newSession);
      setMessages([]);
      setInput('');
    } catch (err) {
      console.error('Error creating session:', err);
      if (err.response?.status === 429) {
        setError('Session limit reached. Try again tomorrow.');
      } else {
        setError('Failed to create teaching session');
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSession || sending) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Optimistic UI update
    setMessages([...messages, userMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const response = await sendTeachingMessage(activeSession.id, input.trim());
      const { userMessage: umsg, aiMessage } = response.data;

      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove optimistic message
        {
          ...umsg,
          timestamp: new Date(umsg.timestamp),
        },
        {
          ...aiMessage,
          timestamp: new Date(aiMessage.timestamp),
        },
      ]);

      // Update session in list
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, message_count: response.data.messageCount, last_message_at: new Date() }
            : s
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);

      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));

      if (err.response?.status === 429) {
        setError('Too many messages. Please wait a moment before sending more.');
      } else if (err.response?.data?.error === 'Session limit reached') {
        setError('This session has reached 100 messages. Please start a new session.');
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    const confirm = window.confirm('End this teaching session?');
    if (!confirm) return;

    try {
      await updateSessionStatus(activeSession.id, 'completed');
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, session_status: 'completed' } : s
        )
      );
      setActiveSession(null);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session');
    }
  };

  // Not Premium - show upgrade prompt
  if (!isPremium) {
    return (
      <div>
        
        <div className="max-w-5xl mx-auto px-4 py-12">
          <UpgradePrompt feature="ai_teaching" />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div>
        
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-slate font-bold mt-4">Loading your teaching sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          {/* Sidebar - Sessions List */}
          <div className="w-80 card p-4 flex flex-col flex-shrink-0">
            <button
              onClick={handleNewSession}
              className="btn-primary mb-4 w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 mx-auto text-brand-500 mb-2" />
                  <p className="text-slate font-semibold text-sm">No sessions yet</p>
                  <p className="text-muted text-xs mt-1">Start your first chat to begin</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      activeSession?.id === session.id
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-border hover:border-muted hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span className="font-bold text-ink truncate text-sm">{session.topic}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate">
                      {session.message_count || 0} messages
                    </span>
                    <span className="text-xs text-muted block mt-1">
                      {new Date(session.last_message_at).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 card flex flex-col">
            {activeSession ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-ink">{activeSession.topic}</h2>
                      <p className="text-sm font-semibold text-slate">Premium AI Teaching</p>
                    </div>
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="text-xs font-bold px-3 py-2 rounded-lg border-2 border-muted hover:border-danger hover:text-danger transition-colors"
                  >
                    End Chat
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="px-6 py-3 bg-red-50 border-b-2 border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                    <p className="text-sm font-semibold text-danger">{error}</p>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && !sending ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-extrabold text-ink mb-2">Start Learning!</h3>
                      <p className="text-slate font-semibold max-w-xs">
                        Ask me anything about {activeSession.topic}. I'm here to help you learn!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user'
                              ? 'bg-brand-500'
                              : 'bg-gray-100'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <span className="text-white font-black text-sm">
                              {user.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                          ) : (
                            <Sparkles className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div
                          className={`max-w-[75%] ${
                            msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'
                          }`}
                        >
                          <div
                            className={`p-4 rounded-2xl border-2 ${
                              msg.role === 'user'
                                ? 'bg-brand-50 border-brand-400'
                                : 'bg-white border-border'
                            }`}
                          >
                            {msg.role === 'user' ? (
                              <p className="text-ink font-semibold leading-relaxed">
                                {msg.content}
                              </p>
                            ) : (
                              <div className="text-ink font-semibold leading-relaxed prose prose-sm max-w-none">
                                <ReactMarkdown
                                  rehypePlugins={[rehypeSanitize]}
                                  components={{
                                    p: ({ node, ...props }) => (
                                      <p className="mb-2 last:mb-0" {...props} />
                                    ),
                                    code: ({ node, inline, ...props }) =>
                                      inline ? (
                                        <code
                                          className="bg-slate-100 px-1.5 py-0.5 rounded text-sm"
                                          {...props}
                                        />
                                      ) : (
                                        <code
                                          className="block bg-slate-100 p-2 rounded text-sm overflow-x-auto mb-2"
                                          {...props}
                                        />
                                      ),
                                    strong: ({ node, ...props }) => (
                                      <strong className="font-extrabold" {...props} />
                                    ),
                                    em: ({ node, ...props }) => (
                                      <em className="italic" {...props} />
                                    ),
                                    ul: ({ node, ...props }) => (
                                      <ul className="list-disc list-inside mb-2" {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                      <ol className="list-decimal list-inside mb-2" {...props} />
                                    ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-semibold text-slate">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                            {msg.role === 'assistant' && (
                              <CopyButton text={msg.content} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Typing Indicator */}
                  {sending && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white border-2 border-border">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t-2 border-border p-4 bg-white">
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !sending) {
                            handleSend();
                          }
                        }}
                        disabled={sending}
                        className="input-field flex-1"
                        placeholder="Ask a question..."
                        maxLength={5000}
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !input.trim()}
                        className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate">
                      {input.length}/5000 characters
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-ink mb-2">Start Learning!</h3>
                  <p className="text-slate font-semibold mb-6">
                    Create a new chat session to learn with AI
                  </p>
                  <button onClick={handleNewSession} className="btn-primary">
                    <span className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      New Chat
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AITeaching;
