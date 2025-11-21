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

    // Fetch all user_logins (user_id, login_time, and login_method)
    const { data: logins, error: loginError } = await supabase
      .from('user_logins')
      .select('user_id,login_time,login_method');

    if (loginError) {
      console.error('Error fetching logins:', loginError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: loginError.message })
      }
    }

    // Build a map of user_id -> latest login info (time and method)
    const latestLoginMap = {};
    for (const login of logins) {
      if (
        !latestLoginMap[login.user_id] ||
        new Date(login.login_time) > new Date(latestLoginMap[login.user_id].login_time)
      ) {
        latestLoginMap[login.user_id] = {
          login_time: login.login_time,
          login_method: login.login_method
        };
      }
    }

    // Attach last_login, last_login_method, and last_activity to each user
    // Use last_activity if available, otherwise fall back to last_login
    const usersWithLogin = users.map(user => ({
      ...user,
      last_login: latestLoginMap[user.id]?.login_time || user.last_login || null,
      last_login_method: latestLoginMap[user.id]?.login_method || null,
      // last_activity is already in the user object from the database query
      // Use last_activity if available, otherwise use last_login
      last_activity: user.last_activity || user.last_login || null,
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

