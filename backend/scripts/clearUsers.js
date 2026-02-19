require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Verify environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function clearUsers() {
    console.log('Starting user cleanup...');
    let hasMore = true;
    let deletedCount = 0;

    try {
        while (hasMore) {
            const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });

            if (error) {
                console.error('Error fetching users:', error);
                break;
            }

            if (!users || users.length === 0) {
                hasMore = false;
                console.log('No users found.');
                break;
            }

            console.log(`Found ${users.length} users...`);

            for (const user of users) {
                const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
                if (deleteError) {
                    console.error(`Failed to delete user ${user.id}:`, deleteError.message);
                } else {
                    console.log(`Deleted user: ${user.email} (${user.id})`);
                    deletedCount++;
                }
            }

            if (users.length < 50) hasMore = false;
        }
        console.log(`Cleanup complete. Deleted ${deletedCount} users.`);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

clearUsers();
