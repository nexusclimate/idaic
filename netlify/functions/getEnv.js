exports.handler = async function (event, context) {
  // Log for debugging
  console.log('getEnv called');
  console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
  
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    N8N_URL: process.env.N8N_URL || '',
    N8N_AUTH: process.env.N8N_AUTH || ''
  };
  
  // Verify we have required values
  if (!envVars.SUPABASE_URL || !envVars.SUPABASE_ANON_KEY) {
    console.error('Missing required environment variables!');
    console.error('SUPABASE_URL:', envVars.SUPABASE_URL ? 'set' : 'MISSING');
    console.error('SUPABASE_ANON_KEY:', envVars.SUPABASE_ANON_KEY ? 'set' : 'MISSING');
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

