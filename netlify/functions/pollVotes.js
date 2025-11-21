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

        // Check if user already voted
        const { data: existing } = await supabase
          .from('poll_votes')
          .select('id')
          .eq('poll_id', voteData.poll_id)
          .eq('email', voteData.email)
          .maybeSingle();

        if (existing) {
          // Update existing vote
          const { data, error } = await supabase
            .from('poll_votes')
            .update({
              selected_slot_index: slotIndex,
              name: voteData.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select();
          
          if (error) {
            return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
          }
          return { statusCode: 200, body: JSON.stringify(data[0]) };
        }

        // Create new vote
        const newVote = {
          poll_id: voteData.poll_id,
          selected_slot_index: slotIndex,
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
        return { statusCode: 201, body: JSON.stringify(data[0]) };
      }
      
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

