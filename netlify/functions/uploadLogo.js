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
    // Sanitize file extension to prevent path traversal, but preserve 'svg'
    const sanitizedExtension = fileExtension.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const uniqueFileName = `${org_id}_${timestamp}_${randomComponent}.${sanitizedExtension}`;

    // Determine content type - explicitly handle SVG files
    let contentType = logo_type || 'image/png';
    if (sanitizedExtension === 'svg' || logo_type === 'image/svg+xml') {
      contentType = 'image/svg+xml';
    }

    console.log('📁 Generated unique filename:', uniqueFileName);
    console.log('📊 Buffer size:', logoBuffer.length, 'bytes');
    console.log('🔍 Using Supabase URL:', process.env.SUPABASE_URL);
    console.log('🔍 Content type:', contentType);

    // Verify bucket exists first (optional check - don't fail if listing doesn't work)
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) {
        console.warn('⚠️ Could not list buckets (will try upload anyway):', listError.message);
      } else {
        const logosBucket = buckets?.find(b => b.name === 'logos');
        if (!logosBucket) {
          console.warn('⚠️ Logos bucket not found in list, but will attempt upload anyway');
          // Don't fail here - service role might still work even if list fails
        } else {
          console.log('✅ Logos bucket found:', logosBucket);
        }
      }
    } catch (listErr) {
      console.warn('⚠️ Error checking buckets (will try upload anyway):', listErr.message);
    }

    // Upload to Supabase Storage
    console.log('📤 Attempting to upload to logos bucket...');
    console.log('📊 Upload details:', {
      bucket: 'logos',
      filename: uniqueFileName,
      bufferSize: logoBuffer.length,
      contentType: contentType
    });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(uniqueFileName, logoBuffer, {
        contentType: contentType,
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Error uploading logo to storage:', uploadError);
      console.error('❌ Upload error details:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
        name: uploadError.name
      });
      
      // Provide more helpful error messages based on common issues
      let errorMessage = 'Failed to upload logo to storage';
      if (uploadError.message) {
        if (uploadError.message.includes('new row violates row-level security policy')) {
          errorMessage = 'Storage bucket policy issue. Please run the storage policies SQL script (sql/setup_logos_storage_policies.sql) in Supabase SQL Editor.';
        } else if (uploadError.message.includes('Bucket not found')) {
          errorMessage = 'Storage bucket "logos" not found. Please create it in Supabase Dashboard > Storage.';
        } else if (uploadError.message.includes('JWT')) {
          errorMessage = 'Authentication error. Please check SUPABASE_SERVICE_ROLE_KEY is correctly set in environment variables.';
        } else {
          errorMessage = `Upload failed: ${uploadError.message}`;
        }
      }
      
      // Log the full error object for debugging
      console.error('❌ Full uploadError object:', JSON.stringify(uploadError, null, 2));
      console.error('❌ uploadError keys:', Object.keys(uploadError));
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: errorMessage,
          details: uploadError.message || JSON.stringify(uploadError),
          hint: 'Check Netlify function logs. If this is an RLS/policy error, run: ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY; in Supabase SQL Editor.',
          fullError: uploadError // Include full error for debugging
        })
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
