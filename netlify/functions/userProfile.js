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
        // Get current user's profile
        // Note: In a real app, you'd get the user ID from authentication
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching user profile:', error);
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
        // Create or update user profile
        const profileData = JSON.parse(event.body);

        // Validate required fields
        if (!profileData.name || !profileData.email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name and email are required' })
          };
        }

        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('email', profileData.email)
          .eq('is_active', true)
          .single();

        let result;
        if (existingProfile) {
          // Update existing profile
          const { data, error } = await supabase
            .from('user_profiles')
            .update({
              ...profileData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProfile.id)
            .select();

          if (error) {
            console.error('Error updating user profile:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: error.message })
            };
          }

          result = data[0];
        } else {
          // Create new profile
          const { data, error } = await supabase
            .from('user_profiles')
            .insert([{
              ...profileData,
              submitted_at: new Date().toISOString()
            }])
            .select();

          if (error) {
            console.error('Error creating user profile:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: error.message })
            };
          }

          result = data[0];
        }

        // Store submission for review
        const { error: submissionError } = await supabase
          .from('user_profile_submissions')
          .insert([{
            user_profile_id: result.id,
            submission_data: profileData,
            status: 'pending'
          }]);

        if (submissionError) {
          console.error('Error creating submission record:', submissionError);
          // Don't fail the request for this, just log it
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Profile submitted successfully. It will be reviewed for approval.',
            profile: result
          })
        };
      }

      case 'PUT': {
        // Update existing user profile
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Profile ID is required' })
          };
        }

        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: updateError.message })
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify(updatedProfile[0])
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('User profile function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
