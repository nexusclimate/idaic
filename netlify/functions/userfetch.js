const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js')

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);

// Read from environment variables (set in Netlify dashboard or .env file)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async function (event, context) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}