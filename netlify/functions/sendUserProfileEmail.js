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

    // Option 1: SendGrid Integration (Recommended)
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: emailData.to,
      from: {
        email: 'noreply@idaic.org', // Must be verified in SendGrid
        name: 'IDAIC Portal'
      },
      subject: emailData.subject,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    };

    await sgMail.send(msg);

    // Option 2: Gmail SMTP (Alternative - Not recommended for production)
    // Uncomment the code below and comment out SendGrid code above to use Gmail
    /*
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
      }
    });

    const mailOptions = {
      from: `"IDAIC Portal" <${process.env.GMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    };

    await transporter.sendMail(mailOptions);
    */

    // Option 2: Alternative - Netlify's built-in email (if enabled)
    // const response = await fetch('https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ emailData })
    // });

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
