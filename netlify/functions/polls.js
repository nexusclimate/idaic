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
        const { poll_id, event_id } = event.queryStringParameters || {};
        
        if (poll_id) {
          // Get specific poll with votes
          const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('*')
            .eq('id', poll_id)
            .maybeSingle();
          
          if (pollError) {
            return { statusCode: 500, body: JSON.stringify({ error: pollError.message }) };
          }
          
          if (!poll) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Poll not found' }) };
          }

          // Get votes for this poll
          const { data: votes, error: votesError } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', poll_id);
          
          if (votesError) {
            return { statusCode: 500, body: JSON.stringify({ error: votesError.message }) };
          }

          // Count votes per time slot
          const voteCounts = {};
          poll.time_slots.forEach((slot, index) => {
            voteCounts[index] = votes.filter(v => (v.selected_slot_index !== undefined ? v.selected_slot_index : v.time_slot_index) === index).length;
          });

          return { 
            statusCode: 200, 
            body: JSON.stringify({ 
              ...poll, 
              votes: votes || [],
              voteCounts 
            }) 
          };
        } else if (event_id) {
          // Get poll by event_id (for poll page using event UUID)
          console.log('Fetching poll for event_id:', event_id);
          const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('*')
            .eq('event_id', event_id)
            .maybeSingle();
          
          if (pollError) {
            console.error('Error fetching poll:', pollError);
            return { statusCode: 500, body: JSON.stringify({ error: pollError.message }) };
          }
          
          if (!poll) {
            console.log('No poll found for event_id:', event_id);
            // Also check if event exists
            const { data: eventData } = await supabase
              .from('events')
              .select('id, title, poll_id')
              .eq('id', event_id)
              .maybeSingle();
            console.log('Event data:', eventData);
            return { statusCode: 404, body: JSON.stringify({ error: 'Poll not found for this event. The poll may not have been created yet.' }) };
          }
          
          console.log('Poll found:', poll.id);

          // Get votes for this poll
          const { data: votes, error: votesError } = await supabase
            .from('poll_votes')
            .select('*')
            .eq('poll_id', poll.id)
            .order('created_at', { ascending: false });
          
          if (votesError) {
            return { statusCode: 500, body: JSON.stringify({ error: votesError.message }) };
          }

          // Count votes per time slot
          const voteCounts = {};
          poll.time_slots.forEach((slot, index) => {
            voteCounts[index] = votes.filter(v => (v.selected_slot_index !== undefined ? v.selected_slot_index : v.time_slot_index) === index).length;
          });

          // Get event details
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', event_id)
            .maybeSingle();

          return { 
            statusCode: 200, 
            body: JSON.stringify({ 
              ...poll, 
              votes: votes || [],
              voteCounts,
              event: eventData || null
            }) 
          };
        } else {
          // Get all polls
          const { data, error } = await supabase
            .from('polls')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
          }
          return { statusCode: 200, body: JSON.stringify(data || []) };
        }
      }
      
      case 'POST': {
        const pollData = JSON.parse(event.body);
        
        if (!pollData.event_id || !pollData.time_slots || pollData.time_slots.length !== 3) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'event_id and 3 time_slots are required' })
          };
        }

        // Generate UUID for the poll
        const pollId = pollData.id || require('crypto').randomUUID();
        
        const newPoll = {
          id: pollId,
          event_id: pollData.event_id,
          time_slots: pollData.time_slots,
          deadline: pollData.deadline || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('polls')
          .insert([newPoll])
          .select();

        if (error) {
          return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }

        // Update event with poll_id
        const { error: updateError } = await supabase
          .from('events')
          .update({ poll_id: pollId })
          .eq('id', pollData.event_id);

        if (updateError) {
          console.error('Error updating event with poll_id:', updateError);
        }

        return { statusCode: 201, body: JSON.stringify(data[0]) };
      }
      
      case 'PUT': {
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);
        
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Poll ID is required' }) };
        }
        
        const { data: updatedPoll, error: updateError } = await supabase
          .from('polls')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select();
        
        if (updateError) {
          return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
        }
        return { statusCode: 200, body: JSON.stringify(updatedPoll[0]) };
      }
      
      case 'DELETE': {
        const { id } = event.queryStringParameters || {};
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Poll ID is required' }) };
        }
        
        const { error } = await supabase
          .from('polls')
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

