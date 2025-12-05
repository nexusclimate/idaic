const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role for write permissions
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
    const loginData = JSON.parse(event.body);

    console.log('📝 Received login tracking request:', {
      user_id: loginData.user_id,
      email: loginData.email,
      login_method: loginData.login_method,
      ip_address: loginData.ip_address,
      country: loginData.country,
      country_code: loginData.country_code,
      city: loginData.city,
      region: loginData.region,
      region_code: loginData.region_code,
      timezone: loginData.timezone,
      isp: loginData.isp,
      organization: loginData.organization,
      asn: loginData.asn,
      latitude: loginData.latitude,
      longitude: loginData.longitude,
      postal_code: loginData.postal_code
    });

    // Validate required fields
    if (!loginData.user_id || !loginData.email) {
      console.error('❌ Missing required fields:', {
        has_user_id: !!loginData.user_id,
        has_email: !!loginData.email,
        full_data: loginData
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'user_id and email are required',
          received: {
            has_user_id: !!loginData.user_id,
            has_email: !!loginData.email
          }
        })
      };
    }

    const loginTime = loginData.login_time || new Date().toISOString();

    // Prepare the insert data with proper defaults and enhanced metadata
    const insertData = {
      user_id: loginData.user_id,
      email: loginData.email,
      ip_address: loginData.ip_address || 'Unknown',
      country: loginData.country || 'Unknown',
      country_code: loginData.country_code || 'Unknown',
      city: loginData.city || 'Unknown',
      region: loginData.region || 'Unknown',
      region_code: loginData.region_code || 'Unknown',
      timezone: loginData.timezone || 'Unknown',
      isp: loginData.isp || 'Unknown',
      organization: loginData.organization || 'Unknown',
      asn: loginData.asn || 'Unknown',
      latitude: loginData.latitude !== null && loginData.latitude !== undefined ? loginData.latitude : null,
      longitude: loginData.longitude !== null && loginData.longitude !== undefined ? loginData.longitude : null,
      postal_code: loginData.postal_code || 'Unknown',
      device: loginData.device || 'Unknown',
      browser: loginData.browser || 'Unknown',
      os: loginData.os || 'Unknown',
      user_agent: loginData.user_agent || 'Unknown',
      login_time: loginTime,
      login_method: loginData.login_method || 'unknown'
    };

    console.log('📤 Inserting login record with data:', insertData);

    // Insert login record
    const { data, error } = await supabase
      .from('user_logins')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ Error inserting login record:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full_error: error
      });
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to insert login record',
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      };
    }

    if (!data || data.length === 0) {
      console.error('❌ No data returned from insert, but no error reported');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Insert succeeded but no data returned'
        })
      };
    }

    console.log('✅ Login tracked successfully:', data[0]);

    // Also update the last_login and last_activity columns in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_login: loginTime,
        last_activity: loginTime  // Also set last_activity on login
      })
      .eq('id', loginData.user_id);

    if (updateError) {
      console.error('❌ Error updating users.last_login:', updateError);
      // Don't fail the entire request, just log the error
    } else {
      console.log('✅ Updated users.last_login for user:', loginData.user_id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Login tracked successfully',
        data: data[0]
      })
    };

  } catch (error) {
    console.error('❌ Track login function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

