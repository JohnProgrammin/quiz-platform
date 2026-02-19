const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabase } = require('../config/database.serverless');

async function grantPro() {
    const username = 'Jokafor809';
    console.log(`Granting PRO access to user: ${username}`);

    // 1. Find user and inspect columns
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (findError || !user) {
        console.error('User not found:', findError);
        return;
    }

    console.log('Found user:', user);
    // Check if subscription_tier exists
    if (user.subscription_tier !== undefined) {
        console.log('Current tier:', user.subscription_tier);
    }

    // 2. Update subscription
    const { error: updateError } = await supabase
        .from('users')
        .update({
            subscription_tier: 'pro',
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating user:', updateError);
    } else {
        console.log('Successfully updated users table subscription_tier to pro!');
    }
}

grantPro();
