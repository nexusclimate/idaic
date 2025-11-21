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
          
          // For each registration, check if user still exists and update role if needed
          const registrationsWithRoles = await Promise.all(
            (data || []).map(async (reg) => {
              if (reg.registration_type === 'internal' || reg.registration_type === 'new') {
                const { data: userData } = await supabase
                  .from('users')
                  .select('role')
                  .eq('email', reg.email)
                  .maybeSingle();
                
                if (userData) {
                  reg.user_role = userData.role || null;
                  reg.registration_type = 'internal';
                } else if (reg.registration_type === 'internal') {
                  // User was internal but no longer exists, mark as new
                  reg.registration_type = 'new';
                  reg.user_role = null;
                }
              }
              return reg;
            })
          );
          
          return { statusCode: 200, body: JSON.stringify(registrationsWithRoles) };
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

        // Check if email exists in users table and get their role
        const { data: userData } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('email', registrationData.email)
          .maybeSingle();

        // Set registration type and role
        let registrationType = 'external';
        let userRole = null;
        
        if (userData) {
          registrationType = 'internal';
          userRole = userData.role || null;
        } else {
          // Not in database, mark as "New"
          registrationType = 'new';
        }

        const newRegistration = {
          ...registrationData,
          registration_type: registrationType,
          user_role: userRole, // Store the user's role from users table
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

