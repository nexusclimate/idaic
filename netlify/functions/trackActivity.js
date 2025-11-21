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
    const activityData = JSON.parse(event.body);

    console.log('📝 Received activity tracking request:', {
      user_id: activityData.user_id,
      email: activityData.email
    });

    // Validate required fields
    if (!activityData.user_id || !activityData.email) {
      console.error('❌ Missing required fields:', {
        has_user_id: !!activityData.user_id,
        has_email: !!activityData.email
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'user_id and email are required'
        })
      };
    }

    const activityTime = activityData.activity_time || new Date().toISOString();

    // Update the last_activity column in users table
    // If last_activity doesn't exist, we'll update last_login as fallback
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        last_activity: activityTime,
        last_login: activityTime  // Also update last_login as fallback if last_activity doesn't exist
      })
      .eq('id', activityData.user_id);

    if (updateError) {
      console.error('❌ Error updating users.last_activity:', updateError);
      // Try updating just last_login as fallback
      const { error: fallbackError } = await supabase
        .from('users')
        .update({ last_login: activityTime })
        .eq('id', activityData.user_id);
      
      if (fallbackError) {
        console.error('❌ Error updating users.last_login (fallback):', fallbackError);
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Failed to update activity',
            message: fallbackError.message
          })
        };
      }
    } else {
      console.log('✅ Updated users.last_activity for user:', activityData.user_id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Activity tracked successfully',
        activity_time: activityTime
      })
    };

  } catch (error) {
    console.error('❌ Track activity function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

