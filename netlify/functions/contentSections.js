const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  // Get user ID from context or Authorization header
  let userId = context.clientContext?.user?.sub;
  
  // If no user ID in context, try to get it from Authorization header
  if (!userId && event.headers.authorization) {
    try {
      const token = event.headers.authorization.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    } catch (err) {
      console.error('Error getting user from token:', err);
    }
  }
  
  console.log('User ID from context or token:', userId); // Debug logging
  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { section } = event.queryStringParameters || {};
        
        if (!section) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Section parameter is required' })
          };
        }

        const { data, error } = await supabase
          .from('content_sections')
          .select('*')
          .eq('section', section)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching content section:', error);
          return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message }) 
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(data && data.length > 0 ? data[0] : null)
        };
      }

      case 'POST': {
        const contentData = JSON.parse(event.body);
        
        if (!contentData.section || !contentData.content) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Section and content are required' })
          };
        }

        // First, deactivate current active content for this section
        const { error: deactivateError } = await supabase
          .from('content_sections')
          .update({ is_active: false })
          .eq('section', contentData.section)
          .eq('is_active', true);

        if (deactivateError) {
          console.error('Error deactivating existing content:', deactivateError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: deactivateError.message })
          };
        }

        // Create new content section
        const { data: newContent, error: insertError } = await supabase
          .from('content_sections')
          .insert([{
            section: contentData.section,
            content: contentData.content,
            content_type: contentData.content_type || 'rich_text',
            created_by: userId || null,
            updated_by: userId || null,
            created_at: new Date().toISOString().replace('Z', '+00:00'),
            updated_at: new Date().toISOString().replace('Z', '+00:00'),
            is_active: true
          }])
          .select();

        if (insertError) {
          console.error('Error creating content section:', insertError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: insertError.message })
          };
        }

        return {
          statusCode: 201,
          body: JSON.stringify(newContent[0])
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Content sections function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
