const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Welcome email HTML template
function getWelcomeEmailHTML(userName) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to IDAIC Members Portal</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #f97316;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #f97316;
      margin-top: 0;
      font-size: 24px;
    }
    .content p {
      margin-bottom: 15px;
      font-size: 16px;
      color: #333;
    }
    .highlight-box {
      background-color: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 20px;
      margin: 20px 0;
    }
    .highlight-box h3 {
      color: #f97316;
      margin-top: 0;
      font-size: 18px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #f97316;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      font-size: 16px;
    }
    .button:hover {
      background-color: #ea580c;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
    }
    .features {
      margin: 25px 0;
    }
    .features ul {
      list-style: none;
      padding: 0;
    }
    .features li {
      padding: 10px 0;
      padding-left: 30px;
      position: relative;
    }
    .features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #f97316;
      font-weight: bold;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to IDAIC</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Members Portal Beta Program</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName || 'there'}!</h2>
      
      <p>We're thrilled to welcome you to the <strong>IDAIC Members Portal Beta Program</strong>! This is an exciting step forward in bringing the IDAIC community together.</p>
      
      <div class="highlight-box">
        <h3>What's Next?</h3>
        <p>Our members portal is designed to be a collaborative space where we share:</p>
        <ul class="features">
          <li><strong>Specific Content</strong> - Access to exclusive resources, insights, and updates</li>
          <li><strong>Events</strong> - Stay informed about upcoming IDAIC events and opportunities</li>
          <li><strong>Collaboration Projects</strong> - Connect with other members and explore potential partnerships</li>
        </ul>
      </div>
      
      <p>As part of our beta program, your feedback and engagement are invaluable in helping us build a platform that truly serves our community's needs.</p>
      
      <p>We're committed to creating a space where innovation, collaboration, and knowledge sharing thrive. Together, we can drive meaningful impact in AI and decarbonisation.</p>
      
      <p style="text-align: center;">
        <a href="https://portal.idaic.org" class="button">Access Members Portal</a>
      </p>
      
      <p>If you have any questions or need assistance, please don't hesitate to reach out to us at <a href="mailto:info@idaic.org" style="color: #f97316;">info@idaic.org</a>.</p>
      
      <p>Welcome aboard, and we look forward to your active participation in the IDAIC community!</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The IDAIC Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This email was sent from <strong>IDAIC Welcome (no-reply@idaic.org)</strong></p>
      <p>Please reply to <a href="mailto:info@idaic.org">info@idaic.org</a> for any inquiries</p>
      <p style="margin-top: 15px;">
        &copy; ${new Date().getFullYear()} IDAIC. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId, userEmail, userName } = JSON.parse(event.body || '{}');

    if (!userId || !userEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId and userEmail are required' })
      };
    }

    // Generate welcome email HTML
    const emailHTML = getWelcomeEmailHTML(userName || 'there');

    // Send email using the existing sendEmail function
    // Use the same domain as the request or fallback to environment variable
    const baseUrl = event.headers?.host 
      ? `https://${event.headers.host}` 
      : process.env.NETLIFY_URL || process.env.URL || 'https://portal.idaic.org';
    const emailResponse = await fetch(`${baseUrl}/.netlify/functions/sendEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        subject: 'Welcome to IDAIC Members Portal - Beta Program',
        html: emailHTML,
        from: 'IDAIC Welcome <no-reply@idaic.org>',
        reply_to: 'info@idaic.org'
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send welcome email:', errorText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send welcome email', details: errorText })
      };
    }

    // Update user record to mark welcome email as sent
    const { error: updateError } = await supabase
      .from('users')
      .update({ welcome_email_sent: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating welcome_email_sent status:', updateError);
      // Don't fail the request if email was sent but DB update failed
      // Log it for manual follow-up
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        emailSent: true
      })
    };

  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

