const { sql } = require('./config/database.serverless');

async function migrate() {
    try {
        console.log('Running migration...');
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
        console.log('Created folders table.');

        // Alter notes table
        await sql`
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
    `;
        console.log('Added folder_id to notes.');

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id)`;
        console.log('Created indexes.');

        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
