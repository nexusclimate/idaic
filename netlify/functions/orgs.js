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
        
        // Try to get from the orgs_with_logos view first, fallback to orgs table
        let { data: organizations, error } = await supabase
          .from('orgs_with_logos')
          .select('*')
          .order('name');

        // If view doesn't exist, try the orgs table directly
        if (error && (error.message.includes('relation "orgs_with_logos" does not exist') || 
                     error.message.includes('relation "public.orgs_with_logos" does not exist'))) {
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
                error: 'Database tables not found. Please run the CREATE_ORGS_AND_LOGOS_COMPLETE.sql script first.',
                details: orgsError.message
              })
            };
          }

          // Logos are now stored directly in the orgs table
          organizations = orgsData;
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

        // Validate required fields - only name is required now
        if (!orgData.name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'name is required' })
          };
        }

        console.log('🔄 Creating new organization with data:', {
          name: orgData.name,
          bio: orgData.bio || '',
          location: orgData.location || '',
          website: orgData.website || '',
          founding_member: orgData.founding_member || false,
          updated_by: orgData.updated_by
        });

        const { data, error } = await supabase
          .from('orgs')
          .insert([{
            name: orgData.name,
            bio: orgData.bio || '',
            location: orgData.location || '',
            website: orgData.website || '',
            logo_display: orgData.logo_display || false, // Default to false
            founding_member: orgData.founding_member || false, // Default to false
            updated_by: orgData.updated_by // Include updated_by for new organizations
            // The database will auto-generate the id (UUID) and updated_at
            // logo_url will be null by default (no logo initially)
          }])
          .select();

        if (error) {
          console.error('❌ Error creating organization:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        console.log('✅ Organization created successfully:', data[0]);
        console.log('🆔 Generated Organization UUID:', data[0].id);
        console.log('👤 Created by user:', data[0].updated_by);
        console.log('⏰ Created at:', data[0].created_at);
        console.log('🔄 Updated at:', data[0].updated_at);
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
        if (updates.logo_display !== undefined) mappedUpdates.logo_display = updates.logo_display;
        if (updates.founding_member !== undefined) mappedUpdates.founding_member = updates.founding_member;
        if (updates.updated_by !== undefined) mappedUpdates.updated_by = updates.updated_by;

        console.log('🔄 Updating organization:', id, 'with data:', mappedUpdates);

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
