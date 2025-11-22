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
        const { poll_id } = event.queryStringParameters || {};
        
        if (!poll_id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'poll_id is required' }) };
        }

        const { data, error } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', poll_id)
          .order('created_at', { ascending: false });
        
        if (error) {
          return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
        return { statusCode: 200, body: JSON.stringify(data || []) };
      }
      
      case 'POST': {
        const voteData = JSON.parse(event.body);
        
        // Support both time_slot_index and selected_slot_index
        const slotIndex = voteData.selected_slot_index !== undefined ? voteData.selected_slot_index : voteData.time_slot_index;
        
        if (!voteData.poll_id || slotIndex === undefined || !voteData.name || !voteData.email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'poll_id, selected_slot_index (or time_slot_index), name, and email are required' })
          };
        }

        // Get poll to find event_id
        const { data: poll, error: pollError } = await supabase
          .from('polls')
          .select('event_id')
          .eq('id', voteData.poll_id)
          .maybeSingle();

        if (pollError || !poll) {
          return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch poll information' }) };
        }

        const eventId = poll.event_id;

        // Check if user already voted
        const { data: existing } = await supabase
          .from('poll_votes')
          .select('id')
          .eq('poll_id', voteData.poll_id)
          .eq('email', voteData.email)
          .maybeSingle();

        let voteResult;
        if (existing) {
          // Update existing vote
          const { data, error } = await supabase
            .from('poll_votes')
            .update({
              time_slot_index: slotIndex,
              name: voteData.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select();
          
          if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
          }
          voteResult = data[0];
        } else {
          // Create new vote
          const newVote = {
            poll_id: voteData.poll_id,
            time_slot_index: slotIndex,
            name: voteData.name,
            email: voteData.email,
            company: voteData.company || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('poll_votes')
            .insert([newVote])
            .select();

          if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
          }
          voteResult = data[0];
        }

        // Automatically register the voter for the event if event_id exists
        if (eventId) {
          try {
            // Check if user already registered for this event
            const { data: existingRegistration } = await supabase
              .from('event_registrations')
              .select('id')
              .eq('event_id', eventId)
              .eq('email', voteData.email)
              .maybeSingle();

            if (!existingRegistration) {
              // Check if email exists in users table and get their role
              const { data: userData } = await supabase
                .from('users')
                .select('id, email, role')
                .eq('email', voteData.email)
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
                event_id: eventId,
                name: voteData.name,
                email: voteData.email,
                company: voteData.company || null,
                title: voteData.title || null,
                registration_type: registrationType,
                user_role: userRole,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              const { error: regError } = await supabase
                .from('event_registrations')
                .insert([newRegistration]);

              if (regError) {
                // Log error but don't fail the vote submission
                console.error('Error creating event registration:', regError);
              }
            }
          } catch (regErr) {
            // Log error but don't fail the vote submission
            console.error('Error processing event registration:', regErr);
          }
        }

        return { statusCode: existing ? 200 : 201, body: JSON.stringify(voteResult) };
      }
      
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

