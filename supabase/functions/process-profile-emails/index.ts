import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ProfileSubmission {
  id: number
  user_profile_id: number
  submission_data: any
  email_status: string
  user_profiles: {
    name: string
    email: string
    category: string
    other_category?: string
    organization_description?: string
    ai_decarbonisation?: string
    challenges?: string
    contribution?: string
    projects?: string
    share_projects?: boolean
    ai_tools?: string
    content?: string
    approval: boolean
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get pending submissions
    const { data: pendingSubmissions, error: fetchError } = await supabase
      .from('user_profile_submissions')
      .select(`
        id,
        user_profile_id,
        submission_data,
        email_status,
        user_profiles (
          name,
          email,
          category,
          other_category,
          organization_description,
          ai_decarbonisation,
          challenges,
          contribution,
          projects,
          share_projects,
          ai_tools,
          content,
          approval
        )
      `)
      .eq('email_status', 'pending')
      .limit(5) // Process in small batches

    if (fetchError) {
      throw fetchError
    }

    if (!pendingSubmissions || pendingSubmissions.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No pending emails to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let successCount = 0
    let failureCount = 0

    // Process each submission
    for (const submission of pendingSubmissions as ProfileSubmission[]) {
      try {
        const profile = submission.user_profiles

        // Prepare email content
        const emailContent = `
New User Profile Submission

From: ${profile.name} (${profile.email})

Category: ${profile.category}
${profile.other_category ? `Other Category: ${profile.other_category}` : ''}

Organization Description:
${profile.organization_description || 'Not provided'}

AI Decarbonisation Plans:
${profile.ai_decarbonisation || 'Not provided'}

Industrial Decarbonisation Challenges:
${profile.challenges || 'Not provided'}

Contribution Approach:
${profile.contribution || 'Not provided'}

Current Projects:
${profile.projects || 'Not provided'}

Open to Sharing Projects: ${profile.share_projects ? 'Yes' : 'No'}

AI Tools/Approaches:
${profile.ai_tools || 'Not provided'}

Available Content:
${profile.content || 'Not provided'}

Approval Given: ${profile.approval ? 'Yes' : 'No'}

---
This email was automatically generated from the IDAIC portal user profile submission form.
Profile ID: ${submission.user_profile_id}
Submission ID: ${submission.id}
        `.trim()

        // DEVELOPMENT MODE: Just log and mark as sent
        if (Deno.env.get('NODE_ENV') === 'development') {
          console.log('📧 EMAIL WOULD BE SENT:', {
            to: 'info@idaic.org',
            subject: `New User Profile Submission - ${profile.name}`,
            contentLength: emailContent.length
          })

          await supabase
            .from('user_profile_submissions')
            .update({
              email_status: 'sent',
              email_sent_at: new Date().toISOString()
            })
            .eq('id', submission.id)

          successCount++
          continue
        }

        // PRODUCTION MODE: Actually send email
        // Option 1: SendGrid
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: 'info@idaic.org' }],
              subject: `New User Profile Submission - ${profile.name}`
            }],
            from: { email: 'noreply@idaic.org' },
            content: [{
              type: 'text/plain',
              value: emailContent
            }]
          })
        })

        if (sendGridResponse.ok) {
          await supabase
            .from('user_profile_submissions')
            .update({
              email_status: 'sent',
              email_sent_at: new Date().toISOString()
            })
            .eq('id', submission.id)
          successCount++
        } else {
          throw new Error(`SendGrid error: ${sendGridResponse.status}`)
        }

      } catch (error) {
        console.error(`Error processing submission ${submission.id}:`, error)

        await supabase
          .from('user_profile_submissions')
          .update({
            email_status: 'failed',
            email_error: error.message,
            email_attempted_at: new Date().toISOString()
          })
          .eq('id', submission.id)

        failureCount++
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${pendingSubmissions.length} submissions`,
        successCount,
        failureCount,
        totalProcessed: pendingSubmissions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Supabase Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})


