-- Clear all quizzes for user (use their user_id)
-- Run this in Neon console or via psql

DELETE FROM quiz_attempts WHERE user_id = 'YOUR_USER_ID';
DELETE FROM quizzes WHERE user_id = 'YOUR_USER_ID';
DELETE FROM weakness_quizzes WHERE user_id = 'YOUR_USER_ID';

-- Reset monthly quiz count
UPDATE users SET monthly_quiz_count = 0 WHERE id = 'YOUR_USER_ID';
