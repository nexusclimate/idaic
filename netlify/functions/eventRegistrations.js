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
        const { event_id } = event.queryStringParameters || {};
        
        if (event_id) {
          // Get registrations for a specific event
          const { data, error } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('event_id', event_id)
            .order('created_at', { ascending: false });
          
          if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
          }
          return { statusCode: 200, body: JSON.stringify(data || []) };
        } else {
          // Get all registrations
          const { data, error } = await supabase
            .from('event_registrations')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
          }
          return { statusCode: 200, body: JSON.stringify(data || []) };
        }
      }
      
      case 'POST': {
        const registrationData = JSON.parse(event.body);
        
        if (!registrationData.event_id || !registrationData.email || !registrationData.name) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'event_id, email, and name are required' })
          };
        }

        // Check if user already registered
        const { data: existing } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', registrationData.event_id)
          .eq('email', registrationData.email)
          .maybeSingle();

        if (existing) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'User already registered for this event' })
          };
        }

        // Determine if internal or external registration
        // Check if email exists in users table
        const { data: userData } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', registrationData.email)
          .maybeSingle();

        const registrationType = userData ? 'internal' : 'external';

        const newRegistration = {
          ...registrationData,
          registration_type: registrationType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('event_registrations')
          .insert([newRegistration])
          .select();

        if (error) {
          return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
        return { statusCode: 201, body: JSON.stringify(data[0]) };
      }
      
      case 'DELETE': {
        const { id } = event.queryStringParameters || {};
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Registration ID is required' }) };
        }
        
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .eq('id', id);
        
        if (error) {
          return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
        return { statusCode: 204, body: '' };
      }
      
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

