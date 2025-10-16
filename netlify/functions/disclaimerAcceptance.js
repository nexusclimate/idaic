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
        // Get parameters from query string for GET requests
        const { userId, email } = event.queryStringParameters || {};

        if (!userId && !email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID or email is required' })
          };
        }

        // Check if disclaimer needs to be shown (90 days since last acceptance)
        let query = supabase
          .from('users')
          .select('disclaimer_accepted_at');

        if (userId) {
          query = query.eq('id', userId);
        } else {
          query = query.eq('email', email);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Error fetching disclaimer status:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        if (!data) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'User not found' })
          };
        }

        // Check if disclaimer needs to be shown
        const needsDisclaimer = !data.disclaimer_accepted_at || 
          (new Date() - new Date(data.disclaimer_accepted_at)) > (90 * 24 * 60 * 60 * 1000); // 90 days in milliseconds

        return {
          statusCode: 200,
          body: JSON.stringify({
            needsDisclaimer,
            lastAcceptedAt: data.disclaimer_accepted_at
          })
        };
      }

      case 'POST': {
        // Get parameters from request body for POST requests
        const { userId, email } = JSON.parse(event.body || '{}');

        if (!userId && !email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User ID or email is required' })
          };
        }

        // Record disclaimer acceptance
        const now = new Date().toISOString();

        let query = supabase
          .from('users')
          .update({ disclaimer_accepted_at: now });

        if (userId) {
          query = query.eq('id', userId);
        } else {
          query = query.eq('email', email);
        }

        const { data, error } = await query.select();

        if (error) {
          console.error('Error updating disclaimer acceptance:', error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
          };
        }

        console.log('✅ Disclaimer accepted by user:', userId || email, 'at', now);

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            acceptedAt: now
          })
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Disclaimer acceptance function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

