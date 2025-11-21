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
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
        }
        return { statusCode: 200, body: JSON.stringify(data || []) };
      }
      case 'POST': {
        const eventData = JSON.parse(event.body);
        // Allow custom UUID to be set, otherwise generate one
        if (!eventData.id) {
          eventData.id = require('crypto').randomUUID();
        }
        // Set timestamps if not provided
        if (!eventData.created_at) {
          eventData.created_at = new Date().toISOString();
        }
        if (!eventData.updated_at) {
          eventData.updated_at = new Date().toISOString();
        }
        // Convert empty strings to null for date fields
        if (eventData.event_date === '' || eventData.event_date === null || eventData.event_date === undefined) {
          eventData.event_date = null;
        }
        const { data: newEvent, error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          .select();
        if (insertError) {
          return { statusCode: 500, body: JSON.stringify({ error: insertError.message }) };
        }
        return { statusCode: 201, body: JSON.stringify(newEvent[0]) };
      }
      case 'PUT': {
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Event ID is required' }) };
        }
        // Convert empty strings to null for date fields
        if (updates.event_date === '' || updates.event_date === null || updates.event_date === undefined) {
          updates.event_date = null;
        }
        const { data: updatedEvent, error: updateError } = await supabase
          .from('events')
          .update(updates)
          .eq('id', id)
          .select();
        if (updateError) {
          return { statusCode: 500, body: JSON.stringify({ error: updateError.message }) };
        }
        return { statusCode: 200, body: JSON.stringify(updatedEvent[0]) };
      }
      case 'DELETE': {
        const { id: deleteId } = event.queryStringParameters || {};
        if (!deleteId) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Event ID is required' }) };
        }
        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .eq('id', deleteId);
        if (deleteError) {
          return { statusCode: 500, body: JSON.stringify({ error: deleteError.message }) };
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