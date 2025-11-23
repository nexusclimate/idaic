const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  // Can be called via POST (manual trigger) or scheduled (cron)
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get all events with reminders enabled that have a date
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('enable_reminders', true)
      .not('event_date', 'is', null);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: eventsError.message })
      };
    }

    if (!events || events.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No events with reminders enabled' })
      };
    }

    const results = [];
    const baseUrl = process.env.BASE_URL || 'https://idaic.nexusclimate.co';

    for (const eventData of events) {
      if (!eventData.event_date) continue;

      const eventDate = new Date(eventData.event_date);
      const reminderDays = eventData.reminder_days_before || 1;
      const reminderHour = eventData.reminder_hour || 9;

      // Calculate when reminder should be sent
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      reminderDate.setHours(reminderHour, 0, 0, 0);

      // Check if it's time to send the reminder (within current hour)
      const reminderDateStart = new Date(reminderDate);
      reminderDateStart.setMinutes(0, 0, 0);
      const reminderDateEnd = new Date(reminderDate);
      reminderDateEnd.setMinutes(59, 59, 999);

      if (now < reminderDateStart || now > reminderDateEnd) {
        continue; // Not time to send yet
      }

      // Check if reminder already sent (check for a sent_reminder_at field or similar)
      // For now, we'll send if it's the right time (you can add a sent_reminder_at field later)

      // Get all active registrations for this event
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventData.id)
        .neq('status', 'cancelled')
        .is('status', null); // Also get registrations without status (active)

      if (regError) {
        console.error(`Error fetching registrations for event ${eventData.id}:`, regError);
        continue;
      }

      if (!registrations || registrations.length === 0) {
        continue;
      }

      // Format event date
      const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Dubai'
        }) + ' GST';
      };

      const eventDateFormatted = formatDate(eventData.event_date);

      // Send reminder to each registrant
      let sentCount = 0;
      let errorCount = 0;

      for (const registration of registrations) {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .button { display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Event Reminder</h1>
                </div>
                <div class="content">
                  <p>Dear ${registration.name},</p>
                  <p>This is a reminder that you are registered for <strong>${eventData.title || 'the event'}</strong>.</p>
                  <p><strong>Event Details:</strong></p>
                  <ul>
                    <li><strong>Date & Time:</strong> ${eventDateFormatted}</li>
                    ${eventData.location ? `<li><strong>Location:</strong> ${eventData.location}</li>` : ''}
                  </ul>
                  ${eventData.description ? `<p>${eventData.description.substring(0, 200)}${eventData.description.length > 200 ? '...' : ''}</p>` : ''}
                  ${registration.cancellation_token ? `
                    <p>If you need to cancel your registration, please click the link below:</p>
                    <p style="text-align: center;">
                      <a href="${baseUrl}/cancel-registration?token=${registration.cancellation_token}&id=${registration.id}" class="button">Cancel Registration</a>
                    </p>
                  ` : ''}
                </div>
                <div class="footer">
                  <p>This is an automated reminder from IDAIC.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const emailResponse = await fetch(`${baseUrl}/.netlify/functions/sendEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: registration.email,
              subject: `Reminder: ${eventData.title || 'Event'} - ${reminderDays} day${reminderDays > 1 ? 's' : ''} away`,
              html: emailHtml
            })
          });

          if (emailResponse.ok) {
            sentCount++;
          } else {
            errorCount++;
            console.error(`Failed to send reminder to ${registration.email}:`, await emailResponse.text());
          }
        } catch (err) {
          errorCount++;
          console.error(`Error sending reminder to ${registration.email}:`, err);
        }
      }

      results.push({
        eventId: eventData.id,
        eventTitle: eventData.title,
        sentCount,
        errorCount,
        totalRegistrations: registrations.length
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Reminder processing completed',
        results
      })
    };

  } catch (error) {
    console.error('Error in sendEventReminders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

