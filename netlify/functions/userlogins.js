const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

// Read from environment variables (set in Netlify dashboard or .env file)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  try {
    // Fetch all user_logins with relevant fields
    const { data: logins, error: loginError } = await supabase
      .from('user_logins')
      .select('id,user_id,email,login_time,login_method,ip_address,country,city,browser,device,os')
      .order('login_time', { ascending: false });

    if (loginError) {
      console.error('Error fetching user_logins:', loginError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: loginError.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(logins || [])
    };
  } catch (err) {
    console.error('Error in userlogins function:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
