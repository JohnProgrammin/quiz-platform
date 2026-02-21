const { sql } = require('./config/database.serverless');

async function createTables() {
  try {
    console.log('\n🚀 Creating database tables...\n');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        bio TEXT,
        avatar_url TEXT,
        subscription_tier VARCHAR(20) DEFAULT 'free',
        subscription_status VARCHAR(20) DEFAULT 'active',
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
      )
    `;
    console.log('✅ Users table created');

    // Create folders table
    await sql`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50) DEFAULT '#22c55e',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Folders table created');

    // Create notes table
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
        title VARCHAR(500),
        filename VARCHAR(500),
        file_size BIGINT,
        file_type VARCHAR(50),
        storage_key TEXT,
        storage_url TEXT,
        content TEXT,
        content_length INTEGER,
        word_count INTEGER,
        ai_summary TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at TIMESTAMP
      )
    `;
    console.log('✅ Notes table created');

    // Create quizzes table
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        question_count INTEGER NOT NULL,
        questions JSONB NOT NULL,
        difficulty VARCHAR(20),
        estimated_duration_minutes INTEGER,
        ai_generation_metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Quizzes table created');

    // Create quiz_attempts table
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER,
        total_questions INTEGER,
        percentage DECIMAL(5,2),
        answers JSONB NOT NULL,
        time_spent_seconds INTEGER,
        weak_topics TEXT[],
        ai_feedback TEXT,
        ai_feedback_generated BOOLEAN DEFAULT false,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Quiz Attempts table created');

    // Create teaching_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS teaching_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500),
        topic VARCHAR(500) NOT NULL,
        note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
        conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
        message_count INTEGER DEFAULT 0,
        tokens_used INTEGER DEFAULT 0,
        session_status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Teaching Sessions table created');

    // Create weakness_quizzes table
    await sql`
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
      )
    `;
    console.log('✅ Weakness Quizzes table created');

    // Create api_keys table
    await sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_hash VARCHAR(255) UNIQUE NOT NULL,
        key_prefix VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ API Keys table created');

    // Create subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255) UNIQUE,
        stripe_price_id VARCHAR(255),
        tier VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        canceled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Subscriptions table created');

    // Create payment_events table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        stripe_event_id VARCHAR(255) UNIQUE,
        event_type VARCHAR(100) NOT NULL,
        amount BIGINT,
        currency VARCHAR(10),
        status VARCHAR(20),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Payment Events table created');

    // Create indexes for performance (CRITICAL for production)
    console.log('\n📑 Creating database indexes...\n');

    // User indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier)`;

    // Folders indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id)`;

    // Notes indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes(user_id, created_at DESC)`;

    // Quizzes indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_note_id ON quizzes(note_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_user_created ON quizzes(user_id, created_at DESC)`;

    // Quiz Attempts indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id)`;

    // Teaching Sessions indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_teaching_sessions_user_id ON teaching_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teaching_sessions_status ON teaching_sessions(session_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teaching_sessions_created_at ON teaching_sessions(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_teaching_sessions_user_status ON teaching_sessions(user_id, session_status)`;

    // Weakness Quizzes indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_weakness_quizzes_user_id ON weakness_quizzes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weakness_quizzes_parent_attempt_id ON weakness_quizzes(parent_attempt_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_weakness_quizzes_created_at ON weakness_quizzes(created_at DESC)`;

    // API Keys indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)`;

    // Subscriptions indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id)`;

    // Payment Events indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON payment_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_event_id ON payment_events(stripe_event_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON payment_events(created_at DESC)`;

    console.log('✅ All indexes created successfully!\n');

    console.log('✅ Database setup complete - PRODUCTION READY!\n');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('\n✅ Tables already exist!\n');
      process.exit(0);
    }
    console.error('\n❌ Error creating tables:', error.message);
    process.exit(1);
  }
}

createTables();
