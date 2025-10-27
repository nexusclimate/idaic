const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { org_id, logo_name, logo_data, logo_type, is_primary, updated_by } = JSON.parse(event.body);

    console.log('🔄 Logo upload request:', { org_id, logo_name, logo_type, is_primary });

    // Validate required fields
    if (!org_id || !logo_name || !logo_data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'org_id, logo_name, and logo_data are required' })
      };
    }

    // Convert base64 data to buffer
    const logoBuffer = Buffer.from(logo_data, 'base64');
    const logoSize = logoBuffer.length;

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = logo_name.split('.').pop() || 'png';
    const uniqueFileName = `${org_id}_${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(uniqueFileName, logoBuffer, {
        contentType: logo_type || 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error uploading logo to storage:', uploadError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to upload logo to storage' })
      };
    }

    console.log('✅ Logo uploaded to storage successfully:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(uniqueFileName);

    const logo_url = urlData.publicUrl;

    // If this is set as primary, unset other primary logos for this org
    if (is_primary) {
      await supabase
        .from('logos')
        .update({ is_primary: false })
        .eq('org_id', org_id);
    }

    // Save logo record to database
    const { data: logoRecord, error: dbError } = await supabase
      .from('logos')
      .insert([{
        org_id: org_id,
        logo_url: logo_url,
        logo_name: logo_name,
        logo_size: logoSize,
        logo_type: logo_type || 'image/png',
        is_primary: is_primary || false
        // Don't include updated_by to avoid foreign key issues
        // The database trigger will handle updated_at
      }])
      .select();

    if (dbError) {
      console.error('❌ Error saving logo record:', dbError);
      // Try to clean up the uploaded file
      await supabase.storage
        .from('logos')
        .remove([uniqueFileName]);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save logo record' })
      };
    }

    console.log('✅ Logo record saved to database successfully:', logoRecord[0]);

    console.log('✅ Logo uploaded successfully:', {
      org_id,
      logo_name,
      logo_url,
      logo_size: logoSize
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Logo uploaded successfully',
        logo: logoRecord[0],
        logo_url: logo_url
      })
    };

  } catch (error) {
    console.error('Upload logo function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
