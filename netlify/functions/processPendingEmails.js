const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get all pending submissions that haven't been emailed yet
    const { data: pendingSubmissions, error: fetchError } = await supabase
      .from('user_profile_submissions')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('email_status', 'pending')
      .limit(10); // Process in batches

    if (fetchError) {
      console.error('Error fetching pending submissions:', fetchError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch pending submissions' })
      };
    }

    if (!pendingSubmissions || pendingSubmissions.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No pending emails to process',
          processed: 0
        })
      };
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each pending submission
    for (const submission of pendingSubmissions) {
      try {
        const profileData = submission.user_profiles;
        const emailData = {
          to: 'info@idaic.org',
          subject: `New User Profile Submission - ${profileData.name}`,
          from: profileData.email,
          name: profileData.name,
          category: profileData.category,
          otherCategory: profileData.other_category || '',
          organizationDescription: profileData.organization_description,
          aiDecarbonisation: profileData.ai_decarbonisation,
          challenges: profileData.challenges,
          contribution: profileData.contribution,
          projects: profileData.projects,
          shareProjects: profileData.share_projects,
          aiTools: profileData.ai_tools,
          content: profileData.content,
          approval: profileData.approval
        };

        // In development, just log
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 WOULD SEND EMAIL:', {
            to: emailData.to,
            subject: emailData.subject,
            from: emailData.from
          });

          // Mark as processed
          await supabase
            .from('user_profile_submissions')
            .update({
              email_status: 'sent',
              email_sent_at: new Date().toISOString()
            })
            .eq('id', submission.id);

          successCount++;
          continue;
        }

        // PRODUCTION: Actually send email
        const emailResponse = await fetch(process.env.URL + '/.netlify/functions/sendUserProfileEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData)
        });

        if (emailResponse.ok) {
          // Mark as sent
          await supabase
            .from('user_profile_submissions')
            .update({
              email_status: 'sent',
              email_sent_at: new Date().toISOString()
            })
            .eq('id', submission.id);

          successCount++;
        } else {
          // Mark as failed
          await supabase
            .from('user_profile_submissions')
            .update({
              email_status: 'failed',
              email_error: `HTTP ${emailResponse.status}: ${emailResponse.statusText}`,
              email_attempted_at: new Date().toISOString()
            })
            .eq('id', submission.id);

          failureCount++;
        }

      } catch (emailError) {
        console.error('Error processing submission:', emailError);

        // Mark as failed
        await supabase
          .from('user_profile_submissions')
          .update({
            email_status: 'failed',
            email_error: emailError.message,
            email_attempted_at: new Date().toISOString()
          })
          .eq('id', submission.id);

        failureCount++;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Processed ${pendingSubmissions.length} submissions`,
        successCount,
        failureCount,
        totalProcessed: pendingSubmissions.length
      })
    };

  } catch (error) {
    console.error('Process pending emails error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};


