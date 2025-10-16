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
      login_method: loginData.login_method
    });

    // Validate required fields
    if (!loginData.user_id || !loginData.email) {
      console.error('❌ Missing required fields:', loginData);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'user_id and email are required' })
      };
    }

    // Insert login record
    const { data, error } = await supabase
      .from('user_logins')
      .insert([{
        user_id: loginData.user_id,
        email: loginData.email,
        ip_address: loginData.ip_address || 'Unknown',
        country: loginData.country || 'Unknown',
        city: loginData.city || 'Unknown',
        region: loginData.region || 'Unknown',
        device: loginData.device || 'Unknown',
        browser: loginData.browser || 'Unknown',
        os: loginData.os || 'Unknown',
        user_agent: loginData.user_agent || 'Unknown',
        login_time: loginData.login_time || new Date().toISOString(),
        login_method: loginData.login_method || 'unknown'
      }])
      .select();

    if (error) {
      console.error('❌ Error inserting login record:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message,
          details: error
        })
      };
    }

    console.log('✅ Login tracked successfully:', data[0]);

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

