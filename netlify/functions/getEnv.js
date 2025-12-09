exports.handler = async function (event, context) {
  // Only return public environment variables (not secrets)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      N8N_URL: process.env.N8N_URL || '',
      N8N_AUTH: process.env.N8N_AUTH || ''
    })
  };
};

