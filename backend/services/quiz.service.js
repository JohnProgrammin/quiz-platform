/**
 * Quiz Service
 * Handles answer grading logic for MCQ questions only
 */

/**
 * Grade all answers for a quiz
 * MCQ-only grading (instant automatic grading)
 */
exports.gradeAnswers = async (questions, answers, userTier) => {
  try {
    let correctCount = 0;
    const gradedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      // Handle both formats: answer could be a number directly or object with 'answer' property
      const userAnswer = typeof answers[i] === 'object' ? answers[i].answer : answers[i];

      // Only MCQ questions
      const graded = {
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
