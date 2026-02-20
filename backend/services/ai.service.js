const Groq = require('groq-sdk');
require('dotenv').config();

/**
 * AI Service using Groq API
 * Handles:
 * - Quiz generation from notes
 * - Pre-quiz teaching summaries
 * - Post-quiz AI feedback and weakness identification
 * - AI teaching sessions
 */

class AIService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    this.model = 'llama-3.3-70b-versatile'; // Latest Groq model (mixtral-8x7b and llama-3.1 decommissioned)
  }

  /**
   * Generate quiz questions from note content
   * @param {string} noteContent - Extracted text from note
   * @param {number} questionCount - Number of questions to generate (10-30)
   * @param {string} tier - Subscription tier (free, pro, premium)
   * @returns {array} - Array of question objects
   */
  async generateQuizQuestions(noteContent, questionCount = 10, tier = 'free') {
    try {
      // Determine question types based on tier
      const questionTypes = tier === 'free'
        ? 'only multiple-choice (mcq)'
        : 'a mix of multiple-choice (mcq) and free-text (text) questions. Decide which type is best for each question.';

      const prompt = `You are an expert educator creating ${questionCount} quiz questions from study material.

Generate exactly ${questionCount} quiz questions based on the following study notes.
Make questions ${questionTypes}.

For multiple-choice questions: Include 4 options with exactly 1 correct answer.
For free-text questions: Provide a sample answer and keywords to check.

Return ONLY valid JSON array with NO other text. Each question object must have:
{
  "type": "mcq" | "text",
  "question": "question text",
  "options": ["A", "B", "C", "D"],  // for mcq only
  "correctAnswer": 0,  // index for mcq, omit for text
  "sampleAnswer": "...",  // for text only
  "keywords": ["keyword1", "keyword2"]  // for text only
}

Study Material:
${noteContent.substring(0, 4000)}

Return ONLY the JSON array, no markdown, no explanation.`;

      const message = await this.groq.chat.completions.create({
        model: this.model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Parse response
      let questions = [];
      const content = message.choices[0].message.content.trim();

      try {
        questions = JSON.parse(content);
      } catch (parseError) {
        // Try extracting JSON from response if wrapped in markdown
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response');
        }
      }

      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid question format');
      }

      return questions.slice(0, questionCount);
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }

  /**
   * Generate pre-quiz teaching summary
   * @param {string} noteContent - Extracted text from note
   * @returns {object} - { summary, keyPoints, readingTime }
   */
  async generateTeachingSummary(noteContent, userName = 'Student') {
    try {
      const prompt = `You are a world-class, empathetic personal AI tutor for ${userName}.
Create a highly engaging, concise teaching summary of the following study material.

Include:
1. A 2-3 sentence executive summary that speaks directly to ${userName}, building excitement for the topic.
2. 5 key concepts they absolutely must understand.
3. 3 critical details to remember.

Study Material:
${noteContent.substring(0, 2000)}

Return as JSON with keys: summary, keyPoints (array), importantDetails (array)`;

      const message = await this.groq.chat.completions.create({
        model: this.model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content.trim();
      const result = JSON.parse(content);

      // Estimate reading time (average 200 words per minute)
      const wordCount = noteContent.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        summary: result.summary,
        keyPoints: result.keyPoints,
        importantDetails: result.importantDetails,
        readingTime,
      };
    } catch (error) {
      console.error('Teaching summary generation error:', error);
      throw error;
    }
  }

  /**
   * Generate AI feedback after quiz
   * @param {string} noteContent - Original note content
   * @param {array} questions - Quiz questions
   * @param {array} answers - User's answers
   * @returns {object} - { feedback, weakTopics, strengths }
   */
  async generateQuizFeedback(noteContent, questions, answers, userName = 'there') {
    try {
      // Calculate score and identify correct/incorrect
      let score = 0;
      const questionAnalysis = questions.map((q, i) => {
        const isCorrect = q.correctAnswer === answers[i];
        if (isCorrect) score++;
        return {
          question: q.question,
          correct: isCorrect,
          topic: q.topic || 'General',
        };
      });

      const percentage = Math.round((score / questions.length) * 100);

      // Identify weak topics
      const incorrectQuestions = questionAnalysis.filter(q => !q.correct);
      const weakTopics = [...new Set(incorrectQuestions.map(q => q.topic))];

      // Identify strengths
      const correctQuestions = questionAnalysis.filter(q => q.correct);
      const strengths = [...new Set(correctQuestions.map(q => q.topic).slice(0, 2))];

      // Generate personalized feedback
      const prompt = `Your student, ${userName}, just completed a quiz with ${percentage}% accuracy on material about: ${noteContent.substring(0, 200)}

Topics they struggled with: ${weakTopics.join(', ')}
Topics they mastered: ${strengths.join(', ')}

You are an encouraging, human-like, world-class personal tutor. 
Write a short, engaging 2-3 sentence feedback message directly addressing ${userName} by name.
1. Acknowledge their score warmly.
2. Highlight their strength: ${strengths.length > 0 ? strengths.join(', ') : 'their hard work'}.
3. Give specific, actionable advice on focusing on their weak areas: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'general review'}.

Keep it highly personal, empathetic, and motivating. Speak directly to them.`;

      const message = await this.groq.chat.completions.create({
        model: this.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const feedback = message.choices[0].message.content.trim();

      return {
        feedback,
        percentage,
        score,
        totalQuestions: questions.length,
        weakTopics: weakTopics.length > 0 ? weakTopics : ['General'],
        strengths: strengths.length > 0 ? strengths : ['Effort and engagement'],
      };
    } catch (error) {
      console.error('Feedback generation error:', error);
      throw error;
    }
  }

  /**
   * Generate weakness mastery mini-quiz
   * @param {string} weakTopic - Topic the student struggled with
   * @param {string} relatedContent - Content related to weak topic
   * @returns {array} - 5 focused quiz questions
   */
  async generateWeaknessMasteryQuiz(weakTopic, relatedContent) {
    try {
      const prompt = `Create 5 focused quiz questions to help a student master the topic: "${weakTopic}"

These should be progressively more challenging and test different aspects of understanding.

Study Material:
${relatedContent.substring(0, 2000)}

Return ONLY JSON array with 5 questions. Each must be multiple-choice with 4 options:
[
  {
    "type": "mcq",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "difficulty": "easy|medium|hard"
  }
]`;

      const message = await this.groq.chat.completions.create({
        model: this.model,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content.trim();
      const questions = JSON.parse(content);

      return questions;
    } catch (error) {
      console.error('Weakness mastery quiz generation error:', error);
      throw error;
    }
  }

  /**
   * AI Teaching conversation
   * Responds to student questions about a topic
   * @param {string} topic - Learning topic
   * @param {string} userMessage - Student's question/message
   * @param {array} conversationHistory - Previous messages
   * @param {string} noteContent - Optional: related note content for context
   * @returns {string} - AI response
   */
  async teachingConversation(topic, userMessage, conversationHistory = [], noteContent = '', userName = 'there') {
    try {
      // Build conversation messages
      const messages = [
        {
          role: 'system',
          content: `You are a world-class, empathetic, and highly engaging personal AI tutor. Your student is named ${userName}.
They are learning about "${topic}".
${noteContent ? `They have study material about this: ${noteContent.substring(0, 1000)}` : ''}

CRITICAL INSTRUCTIONS:
1. Speak directly to ${userName} in a warm, encouraging, human-like tone, using their name naturally.
2. ALWAYS provide the direct answer/solution first.
3. Keep your entire response under 40 words if possible.
4. Be exceptionally encouraging but brief.
5. Do not lecture unless explicitly asked.`,
        },
      ];

      // Add conversation history
      conversationHistory.slice(-6).forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      const response = await this.groq.chat.completions.create({
        model: this.model,
        max_tokens: 500,
        messages,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Teaching conversation error:', error);
      throw error;
    }
  }

  /**
   * Estimate question count based on content length
   * Pro/Premium users get variable questions, Free users get fixed 10
   */
  estimateQuestionCount(contentLength, tier = 'free') {
    if (tier === 'free') return 10;

    // Pro/Premium: 10-30 questions based on content
    const wordCount = contentLength / 5; // Rough word estimate from character count
    if (wordCount < 500) return 10;
    if (wordCount < 1500) return 15;
    if (wordCount < 2500) return 20;
    return 25;
  }

  /**
   * Grade free-text answer using AI
   * Evaluates quality and accuracy of free-text responses
   * @param {string} question - The quiz question
   * @param {string} modelAnswer - Model/correct answer
   * @param {string} userAnswer - Student's answer
   * @returns {object} - { isCorrect, score (0-100), feedback }
   */
  async gradeTextAnswer(question, modelAnswer, userAnswer, userName = 'there') {
    try {
      const prompt = `You are an expert, highly encouraging tutor grading your student ${userName}'s answer to a quiz question.

Question: ${question}

Correct Model Answer: ${modelAnswer}

${userName}'s Answer: ${userAnswer}

Score ${userName}'s answer from 0-100 based on:
1. Accuracy: How correctly does it match the model answer?
2. Completeness: Does it cover the key points?
3. Clarity: Is it well-explained?

Respond with ONLY valid JSON (no markdown, no extra text):
{
  "score": <number 0-100>,
  "isCorrect": <boolean true if score >= 70>,
  "feedback": "<brief, 1-2 sentence feedback addressing ${userName} directly, explaining the score in a warm, constructive way.>"
}

Score 70+ is considered correct. Ensure the feedback is highly personal and coaching.`;

      const message = await this.groq.chat.completions.create({
        model: this.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content.trim();
      const result = JSON.parse(content);

      return {
        isCorrect: result.isCorrect || result.score >= 70,
        score: result.score || 0,
        feedback: result.feedback || 'No feedback available',
      };
    } catch (error) {
      console.error('Text answer grading error:', error);
      throw error;
    }
  }

  /**
   * Extract key topics from content (for weakness identification)
   */
  extractTopics(content) {
    // Simple keyword extraction - in production, could use NLP
    const sentences = content.split('.').slice(0, 5);
    const topics = [];

    sentences.forEach((sentence) => {
      const words = sentence.split(' ');
      words.forEach((word) => {
        if (word.length > 5 && !['student', 'learning', 'study', 'material'].includes(word.toLowerCase())) {
          topics.push(word.replace(/[^a-zA-Z0-9]/g, ''));
        }
      });
    });

    return [...new Set(topics)].slice(0, 5);
  }
}

// Singleton instance
const aiService = new AIService();

module.exports = aiService;
