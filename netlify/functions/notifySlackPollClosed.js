const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('notifySlackPollClosed called with body:', event.body);
    const { poll_id, event_id } = JSON.parse(event.body || '{}');
    console.log('Parsed poll_id:', poll_id, 'event_id:', event_id);

    if (!poll_id || !event_id) {
      console.error('Missing required parameters: poll_id or event_id');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'poll_id and event_id are required' })
      };
    }

    // Get poll data with votes
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', poll_id)
      .maybeSingle();

    if (pollError || !poll) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Poll not found' })
      };
    }

    // Get votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', poll_id);

    if (votesError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: votesError.message })
      };
    }

    // Count votes per time slot
    const voteCounts = {};
    poll.time_slots.forEach((slot, index) => {
      voteCounts[index] = votes.filter(v => 
        (v.selected_slot_index !== undefined ? v.selected_slot_index : v.time_slot_index) === index
      ).length;
    });

    // Get event data
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .maybeSingle();

    if (eventError || !eventData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Event not found' })
      };
    }

    // Format date helper
    const formatDate = (dateString) => {
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

    // Build Slack message
    const eventTitle = eventData.title || 'Untitled Event';
    let message = `*Poll closed for meeting: ${eventTitle}*\n\n`;
    message += `*Poll Results:*\n`;

    // Sort options by vote count (descending)
    const optionsWithVotes = poll.time_slots.map((slot, index) => ({
      slot,
      index,
      votes: voteCounts[index] || 0
    })).sort((a, b) => b.votes - a.votes);

    // Format each option
    optionsWithVotes.forEach((option, idx) => {
      const formattedDate = formatDate(option.slot);
      const voteText = option.votes === 1 ? 'vote' : 'votes';
      message += `${idx + 1}. *${formattedDate}* - ${option.votes} ${voteText}\n`;
    });

    // Send to Slack if webhook URL is configured
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    console.log('SLACK_WEBHOOK_URL configured:', !!SLACK_WEBHOOK_URL);

    if (!SLACK_WEBHOOK_URL) {
      // If no webhook URL, just return success (don't fail)
      console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Notification skipped (no webhook configured)',
          slackMessage: message,
          warning: 'SLACK_WEBHOOK_URL environment variable is not set'
        })
      };
    }

    console.log('Sending message to Slack:', message);
    // Send to Slack
    const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message
      })
    });

    console.log('Slack response status:', slackResponse.status, slackResponse.statusText);

    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error('Slack API error:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to send Slack notification',
          details: errorText,
          slackMessage: message
        })
      };
    }

    const slackResponseText = await slackResponse.text();
    console.log('Slack notification sent successfully. Response:', slackResponseText);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Slack notification sent successfully',
        slackMessage: message
      })
    };

  } catch (error) {
    console.error('Error in notifySlackPollClosed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

