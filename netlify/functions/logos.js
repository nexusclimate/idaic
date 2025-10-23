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
        // Get logos for a specific organization or all logos
        const { org_id } = event.queryStringParameters || {};
        
        let query = supabase
          .from('logos')
          .select('*')
          .order('created_at', { ascending: false });

        if (org_id) {
          query = query.eq('org_id', org_id);
        }

        const { data: logos, error } = await query;

        if (error) {
          console.error('Error fetching logos:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(logos)
        };
      }

      case 'POST': {
        // Create new logo record
        const logoData = JSON.parse(event.body);

        // Validate required fields
        if (!logoData.org_id || !logoData.logo_url || !logoData.logo_name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'org_id, logo_url, and logo_name are required' })
          };
        }

        // If this is set as primary, unset other primary logos for this org
        if (logoData.is_primary) {
          await supabase
            .from('logos')
            .update({ is_primary: false })
            .eq('org_id', logoData.org_id);
        }

        const { data, error } = await supabase
          .from('logos')
          .insert([{
            org_id: logoData.org_id,
            logo_url: logoData.logo_url,
            logo_name: logoData.logo_name,
            logo_size: logoData.logo_size || 0,
            logo_type: logoData.logo_type || 'image/png',
            is_primary: logoData.is_primary || false,
            updated_by: logoData.updated_by
          }])
          .select();

        if (error) {
          console.error('Error creating logo:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Logo created successfully',
            logo: data[0]
          })
        };
      }

      case 'PUT': {
        // Update existing logo
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Logo ID is required' })
          };
        }

        // If setting as primary, unset other primary logos for this org
        if (updates.is_primary) {
          const { data: currentLogo } = await supabase
            .from('logos')
            .select('org_id')
            .eq('id', id)
            .single();

          if (currentLogo) {
            await supabase
              .from('logos')
              .update({ is_primary: false })
              .eq('org_id', currentLogo.org_id)
              .neq('id', id);
          }
        }

        // Map updates
        const mappedUpdates = {};
        if (updates.logo_name !== undefined) mappedUpdates.logo_name = updates.logo_name;
        if (updates.logo_size !== undefined) mappedUpdates.logo_size = updates.logo_size;
        if (updates.logo_type !== undefined) mappedUpdates.logo_type = updates.logo_type;
        if (updates.is_primary !== undefined) mappedUpdates.is_primary = updates.is_primary;
        if (updates.updated_by !== undefined) mappedUpdates.updated_by = updates.updated_by;

        const { data, error } = await supabase
          .from('logos')
          .update(mappedUpdates)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Error updating logo:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Logo updated successfully',
            logo: data[0]
          })
        };
      }

      case 'DELETE': {
        // Delete logo
        const { id } = event.queryStringParameters || {};

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Logo ID is required' })
          };
        }

        const { error } = await supabase
          .from('logos')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting logo:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Logo deleted successfully'
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
    console.error('Logos function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
