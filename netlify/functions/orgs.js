const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  try {
    switch (event.httpMethod) {
      case 'GET': {
        console.log('📝 Fetching organizations...');
        
        // First try to get from the view, if it doesn't exist, fall back to the table
        let { data: organizations, error } = await supabase
          .from('orgs_with_logos')
          .select('*')
          .order('name');

        // If view doesn't exist, try the orgs table directly
        if (error && error.message.includes('relation "orgs_with_logos" does not exist')) {
          console.log('⚠️ View orgs_with_logos not found, trying orgs table directly...');
          
          const { data: orgsData, error: orgsError } = await supabase
            .from('orgs')
            .select('*')
            .order('name');

          if (orgsError) {
            console.error('❌ Error fetching from orgs table:', orgsError);
            return {
              statusCode: 500,
              body: JSON.stringify({ 
                error: 'Database tables not found. Please run the CREATE_ORGS_DATABASE.sql script first.',
                details: orgsError.message
              })
            };
          }

          // Add null logo fields to match expected structure
          organizations = orgsData.map(org => ({
            ...org,
            primary_logo_url: null,
            primary_logo_name: null,
            primary_logo_type: null
          }));
        } else if (error) {
          console.error('❌ Error fetching organizations:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ 
              error: error.message,
              details: error
            })
          };
        }

        console.log('✅ Successfully fetched organizations:', organizations?.length || 0);
        return {
          statusCode: 200,
          body: JSON.stringify(organizations || [])
        };
      }

      case 'POST': {
        // Create new organization
        const orgData = JSON.parse(event.body);

        // Validate required fields
        if (!orgData.org_id || !orgData.name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'org_id and name are required' })
          };
        }

        const { data, error } = await supabase
          .from('orgs')
          .insert([{
            org_id: orgData.org_id,
            name: orgData.name,
            bio: orgData.bio || '',
            location: orgData.location || '',
            website: orgData.website || '',
            updated_by: orgData.updated_by
          }])
          .select();

        if (error) {
          console.error('Error creating organization:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Organization created successfully',
            organization: data[0]
          })
        };
      }

      case 'PUT': {
        // Update existing organization
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Organization ID is required' })
          };
        }

        // Map updates
        const mappedUpdates = {};
        if (updates.name !== undefined) mappedUpdates.name = updates.name;
        if (updates.bio !== undefined) mappedUpdates.bio = updates.bio;
        if (updates.location !== undefined) mappedUpdates.location = updates.location;
        if (updates.website !== undefined) mappedUpdates.website = updates.website;
        if (updates.updated_by !== undefined) mappedUpdates.updated_by = updates.updated_by;

        const { data, error } = await supabase
          .from('orgs')
          .update(mappedUpdates)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Error updating organization:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Organization updated successfully',
            organization: data[0]
          })
        };
      }

      case 'DELETE': {
        // Delete organization
        const { id } = event.queryStringParameters || {};

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Organization ID is required' })
          };
        }

        const { error } = await supabase
          .from('orgs')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting organization:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Organization deleted successfully'
          })
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Organizations function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
