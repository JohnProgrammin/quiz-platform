const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database setup
const db = new sqlite3.Database('./quiz_platform.db');

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    questions TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, and MD files are allowed'));
    }
  },
});

// Create uploads directory
fs.mkdir('uploads', { recursive: true }).catch(console.error);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to extract text from files
async function extractTextFromFile(filepath) {
  const ext = path.extname(filepath).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = await fs.readFile(filepath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (ext === '.txt' || ext === '.md') {
    return await fs.readFile(filepath, 'utf-8');
  }

  throw new Error('Unsupported file type');
}

// Routes

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, fullName || ''],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: this.lastID, username, email, fullName: fullName || '' } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        bio: user.bio,
      },
    });
  });
});

// Profile routes
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, full_name, bio, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      bio: user.bio,
      createdAt: user.created_at,
    });
  });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  const { fullName, bio, email } = req.body;

  db.run(
    'UPDATE users SET full_name = ?, bio = ?, email = ? WHERE id = ?',
    [fullName, bio, email, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Notes routes
app.post('/api/notes/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title } = req.body;
    const filepath = req.file.path;
    const filename = req.file.originalname;

    // Extract text content
    const content = await extractTextFromFile(filepath);

    db.run(
      'INSERT INTO notes (user_id, title, filename, filepath, content) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title || filename, filename, filepath, content],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error saving note' });
        }

        res.json({
          id: this.lastID,
          title: title || filename,
          filename,
          createdAt: new Date().toISOString(),
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

app.get('/api/notes', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, title, filename, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, notes) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(notes.map(note => ({
        id: note.id,
        title: note.title,
        filename: note.filename,
        createdAt: note.created_at,
      })));
    }
  );
});

app.get('/api/notes/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM notes WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, note) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({
        id: note.id,
        title: note.title,
        filename: note.filename,
        content: note.content,
        createdAt: note.created_at,
      });
    }
  );
});

app.delete('/api/notes/:id', authenticateToken, (req, res) => {
  db.get('SELECT filepath FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], async (err, note) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete file
    try {
      await fs.unlink(note.filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    db.run('DELETE FROM notes WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting note' });
      }
      res.json({ message: 'Note deleted successfully' });
    });
  });
});

// Quiz generation route
app.post('/api/quizzes/generate', authenticateToken, async (req, res) => {
  try {
    const { noteId, questionCount = 10 } = req.body;

    // Get note content
    db.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, req.user.id], async (err, note) => {
      if (err || !note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      try {
        // Generate quiz using Groq
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful quiz generator. Generate questions in valid JSON format only, with no additional text or markdown formatting.',
            },
            {
              role: 'user',
              content: `Based on the following study notes, generate ${questionCount} multiple-choice quiz questions. Each question should have 4 options with only one correct answer. Return the result as a JSON array with this exact structure:

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]

The correctAnswer should be the index (0-3) of the correct option.

Study Notes:
${note.content.substring(0, 30000)}

Return ONLY the JSON array, no additional text, no markdown code blocks, just the raw JSON array.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const responseText = completion.choices[0].message.content;
        
        // Extract JSON from response
        let questions;
        try {
          // Try to parse directly
          questions = JSON.parse(responseText);
        } catch (e) {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
          if (jsonMatch) {
            questions = JSON.parse(jsonMatch[1]);
          } else {
            // Try to find JSON array in the text
            const arrayMatch = responseText.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              questions = JSON.parse(arrayMatch[0]);
            } else {
              throw new Error('Could not parse quiz questions');
            }
          }
        }

        // Validate questions format
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Invalid quiz format');
        }

        // Save quiz to database
        db.run(
          'INSERT INTO quizzes (note_id, user_id, title, questions) VALUES (?, ?, ?, ?)',
          [noteId, req.user.id, `Quiz: ${note.title}`, JSON.stringify(questions)],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Error saving quiz' });
            }

            res.json({
              id: this.lastID,
              title: `Quiz: ${note.title}`,
              questions,
              noteId,
            });
          }
        );
      } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Error generating quiz with AI' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all quizzes
app.get('/api/quizzes', authenticateToken, (req, res) => {
  db.all(
    `SELECT q.id, q.title, q.created_at, n.title as note_title 
     FROM quizzes q 
     JOIN notes n ON q.note_id = n.id 
     WHERE q.user_id = ? 
     ORDER BY q.created_at DESC`,
    [req.user.id],
    (err, quizzes) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(quizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        noteTitle: quiz.note_title,
        createdAt: quiz.created_at,
      })));
    }
  );
});

// Get single quiz
app.get('/api/quizzes/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM quizzes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, quiz) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      id: quiz.id,
      title: quiz.title,
      questions: JSON.parse(quiz.questions),
      noteId: quiz.note_id,
      createdAt: quiz.created_at,
    });
  });
});

// Submit quiz attempt
app.post('/api/quizzes/:id/submit', authenticateToken, (req, res) => {
  const { answers } = req.body;

  db.get('SELECT * FROM quizzes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, quiz) => {
    if (err || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = JSON.parse(quiz.questions);
    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    db.run(
      'INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, answers) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, score, questions.length, JSON.stringify(answers)],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Error saving attempt' });
        }

        res.json({
          attemptId: this.lastID,
          score,
          totalQuestions: questions.length,
          percentage: Math.round((score / questions.length) * 100),
        });
      }
    );
  });
});

// Get quiz attempts
app.get('/api/quizzes/:id/attempts', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY completed_at DESC',
    [req.params.id, req.user.id],
    (err, attempts) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }

      res.json(attempts.map(attempt => ({
        id: attempt.id,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        percentage: Math.round((attempt.score / attempt.total_questions) * 100),
        completedAt: attempt.completed_at,
        answers: JSON.parse(attempt.answers),
      })));
    }
  );
});

// Get all attempts for dashboard
app.get('/api/attempts', authenticateToken, (req, res) => {
  db.all(
    `SELECT qa.*, q.title as quiz_title 
     FROM quiz_attempts qa 
     JOIN quizzes q ON qa.quiz_id = q.id 
     WHERE qa.user_id = ? 
     ORDER BY qa.completed_at DESC 
     LIMIT 20`,
    [req.user.id],
    (err, attempts) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }

      res.json(attempts.map(attempt => ({
        id: attempt.id,
        quizId: attempt.quiz_id,
        quizTitle: attempt.quiz_title,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        percentage: Math.round((attempt.score / attempt.total_questions) * 100),
        completedAt: attempt.completed_at,
      })));
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
