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
        
        // Try to get from the orgs table directly (since view might not exist yet)
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
        const organizations = orgsData.map(org => ({
          ...org,
          primary_logo_url: null,
          primary_logo_name: null,
          primary_logo_type: null
        }));

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
        if (!orgData.domain_email || !orgData.name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'domain_email and name are required' })
          };
        }

        const { data, error } = await supabase
          .from('orgs')
          .insert([{
            domain_email: orgData.domain_email,
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
