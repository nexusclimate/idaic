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
    if (!org_id || !logo_data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'org_id (organization UUID) and logo_data are required' })
      };
    }

    // Convert base64 data to buffer
    const logoBuffer = Buffer.from(logo_data, 'base64');
    const logoSize = logoBuffer.length;

    // Generate unique filename using organization UUID
    const timestamp = Date.now();
    const fileExtension = logo_name.split('.').pop() || 'png';
    const uniqueFileName = `${org_id}_${timestamp}.${fileExtension}`;

    console.log('📁 Generated filename:', uniqueFileName);

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

    // Save logo record to database with generated UUID
    const logoId = crypto.randomUUID();
    
    console.log('🆔 Generated logo UUID:', logoId);
    console.log('📊 Logo record data:', {
      id: logoId,
      org_id: org_id
    });
    console.log('🔍 About to insert into logos table...');
    
    const { data: logoRecord, error: dbError } = await supabase
      .from('logos')
      .insert([{
        id: logoId,
        org_id: org_id
        // Only include columns that actually exist in the database
        // Removed logo_url, logo_name, logo_size, logo_type, is_primary as they don't exist
      }])
      .select();

    console.log('📊 Database insert result:', { logoRecord, dbError });

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
      logo_id: logoId,
      org_id
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
