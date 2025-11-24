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
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase configuration');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          message: 'Database connection not configured'
        })
      };
    }

    let activityData;
    try {
      activityData = JSON.parse(event.body);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid request body',
          message: 'Request body must be valid JSON'
        })
      };
    }

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

    // First, check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', activityData.user_id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking if user exists:', checkError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to verify user',
          message: checkError.message || 'Database query failed'
        })
      };
    }

    if (!existingUser) {
      console.warn('⚠️ User not found in database:', activityData.user_id);
      // Don't return an error - just log and return success to avoid spamming errors
      // The user might not be fully set up yet
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'User not found, activity not tracked',
          activity_time: activityTime
        })
      };
    }

    // Update the last_activity column in users table
    // If last_activity doesn't exist, we'll update last_login as fallback
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ 
        last_activity: activityTime,
        last_login: activityTime  // Also update last_login as fallback if last_activity doesn't exist
      })
      .eq('id', activityData.user_id)
      .select();

    if (updateError) {
      console.error('❌ Error updating users.last_activity:', {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      
      // Check if it's a column doesn't exist error
      if (updateError.code === '42703' || updateError.message?.includes('column') || updateError.message?.includes('does not exist')) {
        // Try updating just last_login as fallback
        console.log('⚠️ Trying fallback: updating last_login only');
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
              message: fallbackError.message || 'Database update failed'
            })
          };
        }
        console.log('✅ Updated users.last_login (fallback) for user:', activityData.user_id);
      } else {
        // For other errors, return the error
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Failed to update activity',
            message: updateError.message || 'Database update failed',
            code: updateError.code
          })
        };
      }
    } else {
      // Check if any rows were actually updated
      if (!updateData || updateData.length === 0) {
        console.warn('⚠️ No rows updated for user:', activityData.user_id);
        // This shouldn't happen since we checked user exists, but handle gracefully
      }
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
    console.error('❌ Track activity function error:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred'
      })
    };
  }
};

