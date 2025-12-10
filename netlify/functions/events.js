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
        console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
        
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
        // Remove event_date field if it's empty (don't send null to avoid NOT NULL constraint error)
        if (eventData.event_date === '' || eventData.event_date === null || eventData.event_date === undefined) {
          delete eventData.event_date;
        }
        
        // Handle reminder fields - filter out if columns don't exist in database
        // Only include if they have explicit values (not undefined/null)
        // This prevents errors if the columns don't exist in the database yet
        const reminderFields = ['enable_reminders', 'reminder_days_before', 'reminder_hour'];
        reminderFields.forEach(field => {
          if (eventData[field] === undefined || eventData[field] === null) {
            delete eventData[field];
          }
        });
        
        console.log('Cleaned event data before insert:', JSON.stringify(eventData, null, 2));
        
        const { data: newEvent, error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          .select();
        if (insertError) {
          console.error('Error inserting event:', insertError);
          console.error('Event data that failed:', JSON.stringify(eventData, null, 2));
          return { 
            statusCode: 500, 
            body: JSON.stringify({ 
              error: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            }) 
          };
        }
        console.log('Event created successfully:', newEvent[0]);
        console.log('Returned event_date type:', typeof newEvent[0].event_date, 'value:', newEvent[0].event_date);
        return { statusCode: 201, body: JSON.stringify(newEvent[0]) };
      }
      case 'PUT': {
        const { id } = event.queryStringParameters || {};
        const updates = JSON.parse(event.body);
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Event ID is required' }) };
        }
        console.log('Updating event:', id, 'with updates:', JSON.stringify(updates));
        // Remove event_date field if it's empty (don't send null to avoid NOT NULL constraint error)
        if (updates.event_date === '' || updates.event_date === null || updates.event_date === undefined) {
          console.log('Removing empty event_date field');
          delete updates.event_date;
        } else {
          console.log('Setting event_date to:', updates.event_date);
        }
        
        // Handle reminder fields - filter out if columns don't exist in database
        // Only include if they have explicit values (not undefined/null)
        const reminderFields = ['enable_reminders', 'reminder_days_before', 'reminder_hour'];
        reminderFields.forEach(field => {
          if (updates[field] === undefined || updates[field] === null) {
            delete updates[field];
          }
        });
        
        console.log('Cleaned updates before applying:', JSON.stringify(updates, null, 2));
        
        const { data: updatedEvent, error: updateError } = await supabase
          .from('events')
          .update(updates)
          .eq('id', id)
          .select();
        if (updateError) {
          console.error('Error updating event:', updateError);
          console.error('Updates that failed:', JSON.stringify(updates, null, 2));
          return { 
            statusCode: 500, 
            body: JSON.stringify({ 
              error: updateError.message,
              details: updateError.details,
              hint: updateError.hint,
              code: updateError.code
            }) 
          };
        }
        console.log('Event updated successfully:', updatedEvent[0]);
        console.log('Returned event_date type:', typeof updatedEvent[0].event_date, 'value:', updatedEvent[0].event_date);
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