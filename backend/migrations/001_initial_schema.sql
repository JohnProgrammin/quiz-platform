-- FloraQuiz: PostgreSQL Schema Migration
-- This migration creates all tables for the production-ready quiz platform
-- Run this after creating the Neon PostgreSQL database

-- ============================================
-- USERS TABLE (Enhanced)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  trial_ends_at TIMESTAMP,
  monthly_quiz_count INTEGER DEFAULT 0,
  monthly_quiz_reset_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- ============================================
-- NOTES TABLE (Enhanced with R2 Storage)
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  filename VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  storage_key TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  content TEXT,
  content_length INTEGER,
  word_count INTEGER,
  ai_summary TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- ============================================
-- QUIZZES TABLE (Enhanced with JSONB)
-- ============================================

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  question_count INTEGER NOT NULL,
  questions JSONB NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  estimated_duration_minutes INTEGER,
  ai_generation_metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_note_id ON quizzes(note_id);
CREATE INDEX idx_quizzes_created_at ON quizzes(created_at DESC);

-- ============================================
-- QUIZ ATTEMPTS TABLE (Enhanced with Feedback)
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  answers JSONB NOT NULL,
  time_spent_seconds INTEGER,
  weak_topics TEXT[],
  ai_feedback TEXT,
  ai_feedback_generated BOOLEAN DEFAULT false,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- ============================================
-- TEACHING SESSIONS TABLE (Premium Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS teaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  topic VARCHAR(500) NOT NULL,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  conversation_history JSONB NOT NULL DEFAULT '[]',
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teaching_user_id ON teaching_sessions(user_id);
CREATE INDEX idx_teaching_status ON teaching_sessions(session_status);
CREATE INDEX idx_teaching_last_message ON teaching_sessions(last_message_at DESC);

-- ============================================
-- WEAKNESS QUIZZES TABLE (Pro Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS weakness_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  weak_topic VARCHAR(500) NOT NULL,
  questions JSONB NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  mastery_score DECIMAL(5,2),
  mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_weakness_user_id ON weakness_quizzes(user_id);
CREATE INDEX idx_weakness_parent_attempt ON weakness_quizzes(parent_attempt_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('pro', 'premium')),
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================
-- PAYMENT EVENTS TABLE (Audit Log)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  amount INTEGER,
  currency VARCHAR(10),
  status VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_events_user_id ON payment_events(user_id);
CREATE INDEX idx_payment_events_type ON payment_events(event_type);

-- ============================================
-- USAGE LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_action_type ON usage_logs(action_type);
CREATE INDEX idx_usage_created_at ON usage_logs(created_at);

-- ============================================
-- FEATURE FLAGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  required_tier VARCHAR(20),
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teaching_updated_at BEFORE UPDATE ON teaching_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL SEED DATA (Optional)
-- ============================================

-- Insert feature flags for tier-based access
INSERT INTO feature_flags (flag_name, description, enabled, required_tier) VALUES
  ('ai_teaching', 'Unlimited AI Teaching Feature', true, 'premium'),
  ('weakness_mastery', 'Weakness Identification and Mastery Quizzes', true, 'pro'),
  ('ai_feedback', 'Post-Quiz AI Feedback and Analysis', true, 'pro'),
  ('pre_teach', 'Pre-Quiz AI Teaching Sessions', true, 'pro'),
  ('free_text_questions', 'Free-Text Question Support', true, 'pro'),
  ('unlimited_quizzes', 'Unlimited Quiz Generation', true, 'pro'),
  ('api_access', 'API Access for Integrations', true, 'premium'),
  ('priority_support', 'Priority Support', true, 'premium')
ON CONFLICT (flag_name) DO NOTHING;

-- ============================================
-- MIGRATION INFO
-- ============================================

/*
Migration completed. Next steps:

1. Create Neon account at https://neon.tech
2. Create a new project and database
3. Copy the connection string from Neon dashboard
4. Run this entire SQL file in the Neon SQL Editor
5. Verify all tables are created: SELECT * FROM information_schema.tables;
6. Update backend .env with DATABASE_URL from Neon
7. Run migration script to transfer existing data from SQLite:
   - Export data from SQLite
   - Import into PostgreSQL using migration script

Database size estimate: ~5 MB per 1000 active users (excluding file storage)
*/
