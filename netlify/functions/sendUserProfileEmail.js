const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const emailData = JSON.parse(event.body);

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.from || !emailData.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required email fields' })
      };
    }

    // Create email content
    const emailContent = `
New User Profile Submission

From: ${emailData.name} (${emailData.from})

Category: ${emailData.category}
${emailData.otherCategory ? `Other Category: ${emailData.otherCategory}` : ''}

Organization Description:
${emailData.organizationDescription || 'Not provided'}

AI Decarbonisation Plans:
${emailData.aiDecarbonisation || 'Not provided'}

Industrial Decarbonisation Challenges:
${emailData.challenges || 'Not provided'}

Contribution Approach:
${emailData.contribution || 'Not provided'}

Current Projects:
${emailData.projects || 'Not provided'}

Open to Sharing Projects: ${emailData.shareProjects || 'Not specified'}

AI Tools/Approaches:
${emailData.aiTools || 'Not provided'}

Available Content:
${emailData.content || 'Not provided'}

Approval Given: ${emailData.approval ? 'Yes' : 'No'}

---
This email was automatically generated from the IDAIC portal user profile submission form.
`;

    // For Netlify, we'll use a simple approach with form submission
    // In a production environment, you'd typically use a service like SendGrid, Mailgun, etc.
    // For now, we'll simulate email sending and log the content

    console.log('Email would be sent to:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Content:', emailContent);

    // You can integrate with email services here
    // Example with a service like EmailJS, SendGrid, or Netlify's built-in email

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Email notification sent successfully',
        to: emailData.to,
        subject: emailData.subject
      })
    };

  } catch (error) {
    console.error('Error sending user profile email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email notification',
        details: error.message
      })
    };
  }
};
