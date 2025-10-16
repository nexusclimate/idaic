const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js')

// Read from environment variables (set in Netlify dashboard or .env file)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async function (event, context) {
  try {
    // Fetch all users with all columns
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (userError) {
      console.error('Error fetching users:', userError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: userError.message })
      }
    }

    // Fetch all user_logins (only user_id and login_time)
    const { data: logins, error: loginError } = await supabase
      .from('user_logins')
      .select('user_id,login_time');

    if (loginError) {
      console.error('Error fetching logins:', loginError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: loginError.message })
      }
    }

    // Build a map of user_id -> latest login_time
    const latestLoginMap = {};
    for (const login of logins) {
      if (
        !latestLoginMap[login.user_id] ||
        new Date(login.login_time) > new Date(latestLoginMap[login.user_id])
      ) {
        latestLoginMap[login.user_id] = login.login_time;
      }
    }

    // Attach last_login to each user
    const usersWithLogin = users.map(user => ({
      ...user,
      last_login: latestLoginMap[user.id] || null,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(usersWithLogin)
    }
  } catch (error) {
    console.error('User admin fetch error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

