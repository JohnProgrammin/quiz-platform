/**
 * Quiz Service
 * Handles answer grading logic for MCQ and free-text questions
 */

const aiService = require('./ai.service');

/**
 * Grade all answers for a quiz
 * Handles both MCQ (automatic) and free-text (AI grading)
 */
exports.gradeAnswers = async (questions, answers, userTier) => {
  try {
    let correctCount = 0;
    const gradedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      // Handle both formats: answer could be a number directly or object with 'answer' property
      const userAnswer = typeof answers[i] === 'object' ? answers[i].answer : answers[i];

      let graded = null;

      if (question.type === 'mcq') {
        // Simple MCQ grading
        graded = {
          questionId: question.id,
          questionText: question.text || question.question,
          questionType: 'mcq',
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: userAnswer === question.correctAnswer,
          score: userAnswer === question.correctAnswer ? 100 : 0,
          feedback: null,
        };

        if (graded.isCorrect) {
          correctCount++;
        }
      } else if (question.type === 'text' || question.type === 'free_text') {
        // AI grading for free-text
        graded = {
          questionId: question.id,
          questionText: question.text || question.question,
          questionType: 'text',
          userAnswer: userAnswer,
          correctAnswer: question.modelAnswer || question.sampleAnswer,
          isCorrect: null, // Will be set by AI
          score: null, // Will be set by AI
          feedback: null, // Will be set by AI
        };

        // Only grade with AI for Pro+ users
        if (userTier !== 'free') {
          try {
            const aiGrade = await aiService.gradeTextAnswer(
              question.text || question.question,
              question.modelAnswer || question.sampleAnswer,
              userAnswer
            );

            graded.isCorrect = aiGrade.isCorrect;
            graded.score = aiGrade.score;
            graded.feedback = aiGrade.feedback;

            if (aiGrade.isCorrect) {
              correctCount++;
            }
          } catch (error) {
            console.warn('AI grading failed for question:', question.id);
            // Fallback: keyword matching
            graded = exports.fallbackTextGrading(
              graded,
              question.modelAnswer || question.sampleAnswer,
              userAnswer
            );
            if (graded.isCorrect) {
              correctCount++;
            }
          }
        } else {
          // Free tier: don't grade free-text, just accept it
          graded.isCorrect = null;
          graded.score = null;
          graded.feedback = 'Upgrade to Pro to see AI feedback on this answer';
        }
      }

      gradedAnswers.push(graded);
    }

    return {
      correctCount,
      gradedAnswers,
    };
  } catch (error) {
    console.error('Grade answers error:', error);
    throw error;
  }
};

/**
 * Fallback grading for free-text using keyword matching
 * Used when AI grading fails
 */
exports.fallbackTextGrading = (graded, modelAnswer, userAnswer) => {
  const keywords = modelAnswer
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 3);
  const userText = userAnswer.toLowerCase();

  let matchCount = 0;
  for (const keyword of keywords) {
    if (userText.includes(keyword)) {
      matchCount++;
    }
  }

  const matchPercentage = keywords.length > 0 ? matchCount / keywords.length : 0;
  const isCorrect = matchPercentage >= 0.5;
  const score = Math.round(matchPercentage * 100);

  return {
    ...graded,
    isCorrect,
    score,
    feedback: `Answer ${isCorrect ? 'is mostly correct' : 'is partially correct'
      }. Key concepts matched: ${matchCount}/${keywords.length}`,
  };
};

/**
 * Identify weak topics from quiz performance
 */
exports.identifyWeakTopics = (gradedAnswers, questions) => {
  const weakTopics = [];

  for (let i = 0; i < gradedAnswers.length; i++) {
    const graded = gradedAnswers[i];
    const question = questions[i];

    // Mark incorrect answers as weak areas
    if (!graded.isCorrect) {
      const topic = question.topic || question.category || 'General';
      if (!weakTopics.includes(topic)) {
        weakTopics.push(topic);
      }
    }
  }

  return weakTopics;
};
