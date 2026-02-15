-- Gamification System Migration
-- Adds XP, levels, streaks, and achievements

CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gamification_user_id ON user_gamification(user_id);
CREATE INDEX idx_gamification_level ON user_gamification(level DESC);
CREATE INDEX idx_gamification_xp ON user_gamification(total_xp DESC);

-- Achievements catalog
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_key ON achievements(key);

-- User achievements (unlocked badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at DESC);

-- XP transaction log for auditing
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at DESC);

-- Seed default achievements
INSERT INTO achievements (key, name, description, icon, tier, xp_reward) VALUES
  ('first_quiz', 'First Steps', 'Complete your first quiz', '🎯', 'bronze', 10),
  ('perfect_score', 'Perfectionist', 'Score 100% on any quiz', '⭐', 'gold', 50),
  ('quiz_streak_3', '3-Day Streak', 'Complete quizzes 3 days in a row', '🔥', 'bronze', 25),
  ('quiz_streak_7', 'Week Warrior', 'Complete quizzes 7 days in a row', '🔥', 'silver', 75),
  ('quiz_streak_30', 'Monthly Master', 'Complete quizzes 30 days in a row', '🔥', 'gold', 250),
  ('level_5', 'Rising Star', 'Reach level 5', '⚡', 'bronze', 50),
  ('level_10', 'Quiz Expert', 'Reach level 10', '⚡', 'silver', 100),
  ('level_25', 'Learning Legend', 'Reach level 25', '⚡', 'gold', 250),
  ('quiz_10', 'Quiz Novice', 'Complete 10 quizzes', '🎓', 'bronze', 30),
  ('quiz_50', 'Quiz Enthusiast', 'Complete 50 quizzes', '🎓', 'silver', 100),
  ('quiz_100', 'Quiz Master', 'Complete 100 quizzes', '🎓', 'gold', 250),
  ('speed_demon', 'Speed Demon', 'Complete a quiz in under 2 minutes', '⚙️', 'silver', 40),
  ('consistency', 'Consistent Learner', 'Maintain a 7-day streak', '📈', 'silver', 60)
ON CONFLICT (key) DO NOTHING;
