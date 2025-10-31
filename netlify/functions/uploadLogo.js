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
    console.log('🔍 Request body keys:', Object.keys(JSON.parse(event.body)));
    console.log('🔍 Full request body:', JSON.parse(event.body));

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

    // Generate unique filename using organization UUID + timestamp + random component
    // This ensures uniqueness even if multiple uploads happen at the same time
    const timestamp = Date.now();
    const randomComponent = Math.random().toString(36).substring(2, 15);
    const fileExtension = logo_name.split('.').pop() || 'png';
    // Sanitize file extension to prevent path traversal
    const sanitizedExtension = fileExtension.replace(/[^a-zA-Z0-9]/g, '');
    const uniqueFileName = `${org_id}_${timestamp}_${randomComponent}.${sanitizedExtension}`;

    console.log('📁 Generated unique filename:', uniqueFileName);

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

    // Generate a permanent public URL for the logo
    // Public URLs are stable and don't expire, making them ideal for storage in the database
    // NOTE: The 'logos' storage bucket must be configured as public in Supabase for these URLs to work
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(uniqueFileName);
    
    const logo_url = urlData.publicUrl;

    if (!logo_url) {
      console.error('❌ Failed to generate public URL for logo');
      // Try to clean up the uploaded file
      await supabase.storage
        .from('logos')
        .remove([uniqueFileName]);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to generate public URL for logo. Please ensure the logos storage bucket is configured as public in Supabase.',
          hint: 'In Supabase Dashboard, go to Storage > logos bucket > Settings and ensure "Public bucket" is enabled.'
        })
      };
    }

    console.log('✅ Generated permanent public URL:', logo_url);

    // Update the organization record with the logo URL
    console.log('📊 Updating organization with logo URL:', {
      org_id: org_id,
      logo_url: logo_url
    });
    console.log('🔍 About to update orgs table...');
    
    const { data: orgRecord, error: dbError } = await supabase
      .from('orgs')
      .update({ 
        logo_url: logo_url, 
        logo: true,
        updated_by: updated_by // Include updated_by for logo updates
      })
      .eq('id', org_id)
      .select();

    console.log('📊 Database update result:', { orgRecord, dbError });

    if (dbError) {
      console.error('❌ Error updating organization with logo URL:', dbError);
      console.error('❌ Error details:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      console.error('❌ Update data that failed:', {
        org_id: org_id,
        logo_url: logo_url
      });
      
      // Try to clean up the uploaded file
      await supabase.storage
        .from('logos')
        .remove([uniqueFileName]);
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to update organization with logo URL',
          details: dbError.message,
          hint: dbError.hint
        })
      };
    }

    console.log('✅ Organization updated with logo URL successfully:', orgRecord[0]);
    console.log('👤 Updated by user:', orgRecord[0].updated_by);
    console.log('🔄 Updated at:', orgRecord[0].updated_at);

    console.log('✅ Logo uploaded successfully:', {
      org_id,
      logo_url
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Logo uploaded successfully',
        organization: orgRecord[0],
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
