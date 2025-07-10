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
  const { httpMethod } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

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

      case 'POST':
        const project = JSON.parse(event.body);
        const { data: newProject, error: insertError } = await supabase
          .from('projects')
          .insert([project])
          .select();

        if (insertError) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: insertError.message })
          }
        }

        return {
          statusCode: 201,
          body: JSON.stringify(newProject[0])
        }

      case 'PUT':
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);
        
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Project ID is required' })
          }
        }

        const { data: updatedProject, error: updateError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select();

        if (updateError) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: updateError.message })
          }
        }

        return {
          statusCode: 200,
          body: JSON.stringify(updatedProject[0])
        }

      case 'DELETE':
        const { id: deleteId } = event.queryStringParameters || {};
        
        if (!deleteId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Project ID is required' })
          }
        }

        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: deleteError.message })
          }
        }

        return {
          statusCode: 204,
          body: ''
        }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}