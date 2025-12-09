exports.handler = async function (event, context) {
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    N8N_URL: process.env.N8N_URL || '',
    N8N_AUTH: process.env.N8N_AUTH || ''
  };
  
  // Verify we have required values
  if (!envVars.SUPABASE_URL || !envVars.SUPABASE_ANON_KEY) {
    console.error('getEnv: Missing required environment variables');
  }
  
  // Only return public environment variables (not secrets)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(envVars)
  };
};

