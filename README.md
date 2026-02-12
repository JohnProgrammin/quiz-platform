# AI Quiz Platform

A full-stack web application that uses AI to generate personalized quizzes from your study notes.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Profile Management**: Edit your profile information
- **Note Upload**: Upload study materials (PDF, TXT, MD files)
- **AI Quiz Generation**: Automatically generate quizzes using Claude AI
- **Interactive Quizzes**: Take quizzes with a modern, user-friendly interface
- **Progress Tracking**: View your scores, attempt history, and performance analytics
- **Unlimited Retakes**: Practice as much as you want with full history

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- TailwindCSS for styling
- Axios for API calls
- Lucide React for icons
- Vite as build tool

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- Multer for file uploads
- pdf-parse for PDF extraction
- Anthropic Claude API for quiz generation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key (FREE - get one at https://console.groq.com)

## Installation

### 1. Clone or Extract the Project

```bash
cd quiz-platform
```

### 2. Get a FREE Groq API Key
- Go to https://console.groq.com
- Sign up (no credit card required!)
- Create a new API key
- Copy it (you'll need it in step 3)

### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Groq API key
# nano .env or use any text editor
```

Edit the `.env` file:
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GROQ_API_KEY=your-groq-api-key-here
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start

# Or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3001`

### Start Frontend Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage Guide

### 1. Create an Account
- Navigate to `http://localhost:3000`
- Click "Sign up" and create your account
- Or use the login page if you already have an account

### 2. Upload Study Notes
- Go to the "Notes" page
- Click the upload area and select a PDF, TXT, or MD file
- Your note will be processed and saved

### 3. Generate a Quiz
- On the Notes page, click "Generate Quiz" next to any uploaded note
- The AI will analyze your note and create 10 multiple-choice questions
- You'll be automatically redirected to the quiz

### 4. Take the Quiz
- Read each question carefully
- Select your answer by clicking on an option
- Use the navigation buttons or question navigator to move between questions
- Submit when you're done

### 5. View Results
- See your score and detailed breakdown
- Review correct and incorrect answers
- Track your progress with attempt history
- Retake the quiz to improve your score

### 6. Track Progress
- Visit the Dashboard to see your overall statistics
- View recent quiz attempts
- Monitor your average score across all quizzes

## Project Structure

```
quiz-platform/
├── backend/
│   ├── server.js           # Main Express server
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   ├── quiz_platform.db    # SQLite database (created on first run)
│   └── uploads/            # Uploaded files directory
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Notes.jsx
    │   │   ├── Quiz.jsx
    │   │   ├── QuizResults.jsx
    │   │   └── Navbar.jsx
    │   ├── App.jsx         # Main App component
    │   ├── main.jsx        # Entry point
    │   ├── api.js          # API utility functions
    │   └── index.css       # Global styles
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite configuration
    ├── tailwind.config.js  # TailwindCSS configuration
    └── index.html          # HTML template
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Notes
- `POST /api/notes/upload` - Upload a note
- `GET /api/notes` - Get all user notes
- `GET /api/notes/:id` - Get specific note
- `DELETE /api/notes/:id` - Delete a note

### Quizzes
- `POST /api/quizzes/generate` - Generate quiz from note
- `GET /api/quizzes` - Get all user quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/attempts` - Get quiz attempt history
- `GET /api/attempts` - Get all quiz attempts

## Features in Detail

### AI Quiz Generation
The platform uses Claude AI to generate contextual, relevant questions from your study materials. The AI:
- Analyzes the content and structure of your notes
- Creates 10 multiple-choice questions with 4 options each
- Ensures questions cover key concepts
- Provides varied difficulty levels

### Progress Tracking
- **Dashboard**: Overview of all your stats
- **Attempt History**: Complete record of every quiz attempt
- **Score Analytics**: Average scores, best scores, and trends
- **Question Review**: Detailed breakdown of correct/incorrect answers

### Security
- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Protected API routes
- Input validation and sanitization

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Ensure all dependencies are installed: `npm install`
- Verify your `.env` file has valid values

### Frontend won't start
- Check if port 3000 is already in use
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules && npm install`

### Quiz generation fails
- Verify your Anthropic API key is correct
- Check if you have API credits remaining
- Ensure the uploaded note has readable content

### File upload fails
- Check file format (PDF, TXT, or MD only)
- Verify file size is reasonable (under 10MB)
- Ensure the `uploads/` directory exists and is writable

## Development

### Adding New Features
1. Backend: Add routes in `server.js`
2. Frontend: Create components in `src/components/`
3. Update API calls in `src/api.js`

### Database Schema
The SQLite database has 4 main tables:
- `users`: User accounts
- `notes`: Uploaded study materials
- `quizzes`: Generated quizzes
- `quiz_attempts`: Quiz results and history

## Future Enhancements

Potential features to add:
- Different quiz types (true/false, short answer)
- Flashcard mode
- Study groups and sharing
- Spaced repetition algorithm
- Mobile app version
- Export results to PDF
- Social features and leaderboards

## License

This project is open source and available for educational purposes.

## Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the console logs for error messages
3. Ensure all environment variables are set correctly
4. Verify your Anthropic API key is valid

## Credits

Built with:
- React
- TailwindCSS
- Anthropic Claude AI
- Express.js
- SQLite
