const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Email service using Resend (can be changed to SendGrid, Mailgun, etc.)
// Set RESEND_API_KEY in environment variables
// Alternative: Use SMTP with nodemailer

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, html, text } = JSON.parse(event.body || '{}');

    if (!to || !subject || (!html && !text)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'to, subject, and html/text are required' })
      };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@idaic.org';

    // If Resend is configured, use it
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html || text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API error:', errorData);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to send email', details: errorData })
        };
      }

      const result = await response.json();
      console.log('Email sent successfully via Resend:', result);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, messageId: result.id })
      };
    }

    // Fallback: Log email (for development/testing)
    console.log('Email service not configured. Would send email:', {
      to,
      subject,
      html: html || text
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email service not configured (RESEND_API_KEY not set). Email logged to console.',
        preview: { to, subject }
      })
    };

  } catch (error) {
    console.error('Error in sendEmail:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

