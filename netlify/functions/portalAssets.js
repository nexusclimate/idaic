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
        // Get the current portal asset
        const { data, error } = await supabase
          .from('portal_assets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching portal asset:', error);
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
        // Create new portal asset
        const assetData = JSON.parse(event.body);
        
        // Create new portal asset
        const newAssetData = {
          title: assetData.title,
          image_data: assetData.image_data,
          image_type: assetData.image_type,
          created_at: new Date().toISOString()
        };
        
        const { data: newAsset, error: insertError } = await supabase
          .from('portal_assets')
          .insert([newAssetData])
          .select();
        
        if (insertError) {
          console.error('Error creating portal asset:', insertError);
          return { 
            statusCode: 500, 
            body: JSON.stringify({ error: insertError.message }) 
          };
        }
        
        return { 
          statusCode: 201, 
          body: JSON.stringify(newAsset[0]) 
        };
      }
      
      case 'PUT': {
        // Update existing portal asset
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);
        
        if (!id) {
          return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Asset ID is required' }) 
          };
        }
        
        const { data: updatedAsset, error: updateError } = await supabase
          .from('portal_assets')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (updateError) {
          console.error('Error updating portal asset:', updateError);
          return { 
            statusCode: 500, 
            body: JSON.stringify({ error: updateError.message }) 
          };
        }
        
        return { 
          statusCode: 200, 
          body: JSON.stringify(updatedAsset[0]) 
        };
      }
      
      case 'DELETE': {
        // Delete portal asset
        const { id: deleteId } = event.queryStringParameters || {};

        if (!deleteId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Asset ID is required' })
          };
        }
        
        const { error: deleteError } = await supabase
          .from('portal_assets')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) {
          console.error('Error deleting portal asset:', deleteError);
          return { 
            statusCode: 500, 
            body: JSON.stringify({ error: deleteError.message }) 
          };
        }
        
        return { 
          statusCode: 200, 
          body: JSON.stringify({ message: 'Asset deleted successfully' }) 
        };
      }
      
      default:
        return { 
          statusCode: 405, 
          body: JSON.stringify({ error: 'Method not allowed' }) 
        };
    }
  } catch (error) {
    console.error('Portal assets function error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Internal server error' }) 
    };
  }
};
