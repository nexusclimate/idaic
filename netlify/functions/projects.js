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

exports.handler = async function (event, context) {
  console.log('Projects function called with method:', event.httpMethod);
  
  try {
    switch (event.httpMethod) {
      case 'GET':
        console.log('Attempting to fetch projects...');
        
        // If there's a test parameter, check table structure
        if (event.queryStringParameters && event.queryStringParameters.test === 'structure') {
          console.log('Testing table structure...');
          try {
            const { data: tableInfo, error: tableError } = await supabase
              .from('projects')
              .select('*')
              .limit(0);
            
            if (tableError) {
              console.error('Table structure error:', tableError);
              return {
                statusCode: 500,
                body: JSON.stringify({ 
                  error: 'Table structure issue',
                  details: tableError.message 
                })
              }
            }
            
            console.log('Table structure test passed');
            return {
              statusCode: 200,
              body: JSON.stringify({ 
                message: 'Table structure is correct',
                tableExists: true 
              })
            }
          } catch (err) {
            console.error('Table test error:', err);
            return {
              statusCode: 500,
              body: JSON.stringify({ 
                error: 'Table test failed',
                details: err.message 
              })
            }
          }
        }
        
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

      case 'POST':
        console.log('Attempting to add project...');
        const project = JSON.parse(event.body);
        console.log('Project data received:', JSON.stringify(project, null, 2));
        console.log('Project data keys:', Object.keys(project));
        
        // Check if id is present and remove it
        if (project.id !== undefined) {
          console.log('WARNING: id field found in project data:', project.id);
          delete project.id;
          console.log('Removed id field, updated project data:', JSON.stringify(project, null, 2));
        }
        
        const { data: newProject, error: insertError } = await supabase
          .from('projects')
          .insert([project])
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          console.error('Error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          return {
            statusCode: 500,
            body: JSON.stringify({ 
              error: insertError.message,
              details: insertError.details,
              hint: insertError.hint 
            })
          }
        }

        console.log('Project added successfully:', newProject[0]);
        return {
          statusCode: 201,
          body: JSON.stringify(newProject[0])
        }

      case 'PUT':
        console.log('Attempting to update project...');
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
          console.error('Update error:', updateError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: updateError.message })
          }
        }

        console.log('Project updated successfully:', updatedProject[0]);
        return {
          statusCode: 200,
          body: JSON.stringify(updatedProject[0])
        }

      case 'DELETE':
        console.log('Attempting to delete project...');
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
          console.error('Delete error:', deleteError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: deleteError.message })
          }
        }

        console.log('Project deleted successfully');
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
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}