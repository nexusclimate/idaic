const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js')

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Read from environment variables (set in Netlify dashboard or .env file)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Mock data for testing
const mockProjects = [
  {
    id: 1,
    title: 'Green Energy Initiative',
    company_name: 'EcoCorp',
    date: '2024-06-01',
    description: 'A project focused on developing sustainable energy solutions for urban areas.',
    created_at: '2024-06-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Ocean Cleanup',
    company_name: 'BlueWave',
    date: '2024-05-15',
    description: 'Removing plastic waste from the world\'s oceans using innovative technology.',
    created_at: '2024-05-15T00:00:00Z'
  },
  {
    id: 3,
    title: 'Urban Forest',
    company_name: 'TreeCity',
    date: '2024-07-10',
    description: 'Planting trees in metropolitan areas to improve air quality and biodiversity.',
    created_at: '2024-07-10T00:00:00Z'
  }
];

exports.handler = async function (event, context) {
  console.log('Projects function called with method:', event.httpMethod);
  
  try {
    // For now, let's just handle GET to test the connection
    if (event.httpMethod === 'GET') {
      console.log('Attempting to fetch projects...');
      
      // First, try with mock data to test the function
      console.log('Returning mock data for testing');
      return {
        statusCode: 200,
        body: JSON.stringify(mockProjects)
      }
      
      // Uncomment this when ready to test real database connection
      /*
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data: data?.length, error });

      if (error) {
        console.error('Supabase error:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data || [])
      }
      */
    }
    
    // For other methods, return a simple response for now
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not implemented yet' })
    }
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}