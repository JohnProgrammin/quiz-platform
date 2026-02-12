-- FloraQuiz: Clear All User Quizzes and Reset Quota
-- Run this in Neon SQL Editor to wipe test quizzes

-- IMPORTANT: Replace 'joka kafor809' with your actual username
-- Or replace the WHERE clause with your actual user ID

-- Get user ID (check this first)
SELECT id, username, monthly_quiz_count FROM users WHERE username = 'Jokafor809';

-- Delete all quiz data for this user
DELETE FROM quiz_attempts WHERE user_id IN (SELECT id FROM users WHERE username = 'Jokafor809');
DELETE FROM weakness_quizzes WHERE user_id IN (SELECT id FROM users WHERE username = 'Jokafor809');
DELETE FROM quizzes WHERE user_id IN (SELECT id FROM users WHERE username = 'Jokafor809');
DELETE FROM teaching_sessions WHERE user_id IN (SELECT id FROM users WHERE username = 'Jokafor809');

-- Reset monthly quiz count
UPDATE users SET monthly_quiz_count = 0, monthly_quiz_reset_at = NOW()
WHERE username = 'Jokafor809';

-- Verify cleanup
SELECT
  u.username,
  (SELECT COUNT(*) FROM quizzes WHERE user_id = u.id) as quiz_count,
  (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = u.id) as attempt_count,
  u.monthly_quiz_count,
  u.subscription_tier
FROM users u
WHERE username = 'Jokafor809';
