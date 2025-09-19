-- Supabase Webhook Configuration for Email Processing
-- This SQL can be run in Supabase SQL Editor or Dashboard

-- Option 1: Direct webhook to Edge Function (Recommended)
-- Set up webhook in Supabase Dashboard:
-- 1. Go to Database > Webhooks
-- 2. Create new webhook
-- 3. Configure:
--    - Name: Process Profile Emails
--    - Table: user_profile_submissions
--    - Events: INSERT
--    - Type: Edge Function
--    - Function: process-profile-emails
--    - Conditions: email_status = 'pending'

-- Option 2: HTTP Webhook (Alternative)
-- Uncomment below for HTTP webhook approach:

/*
-- Create function to call external webhook
CREATE OR REPLACE FUNCTION call_email_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://your-netlify-site.netlify.app/.netlify/functions/processPendingEmails';
  payload JSONB;
BEGIN
  -- Only process if email_status is pending
  IF NEW.email_status = 'pending' THEN
    payload := jsonb_build_object(
      'type', 'new_submission',
      'submission_id', NEW.id,
      'profile_id', NEW.user_profile_id,
      'timestamp', extract(epoch from now())
    );

    -- Call webhook (you can add error handling here)
    PERFORM
      net.http_post(
        url := webhook_url,
        body := payload,
        headers := '{"Content-Type": "application/json"}'::jsonb
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for webhook
CREATE TRIGGER email_webhook_trigger
  AFTER INSERT ON user_profile_submissions
  FOR EACH ROW
  EXECUTE FUNCTION call_email_webhook();
*/

-- Option 3: Real-time Subscription (For monitoring dashboard)
-- This can be used in your frontend to listen for new submissions

/*
-- Example: Listen for new submissions in your React app
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const subscription = supabase
  .channel('new_submissions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'user_profile_submissions'
    },
    (payload) => {
      console.log('New submission:', payload.new)
      // Update your UI or trigger email processing
    }
  )
  .subscribe()
*/

-- Monitoring Query: Check submission status
-- Run this in Supabase SQL Editor to monitor email processing:
/*
SELECT
  ups.id,
  ups.email_status,
  ups.email_sent_at,
  ups.email_attempted_at,
  ups.email_error,
  up.name,
  up.email,
  ups.submitted_at
FROM user_profile_submissions ups
JOIN user_profiles up ON ups.user_profile_id = up.id
ORDER BY ups.submitted_at DESC
LIMIT 10;
*/

-- Performance monitoring: Email processing stats
/*
SELECT
  email_status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (email_sent_at - submitted_at))) as avg_processing_time_seconds
FROM user_profile_submissions
WHERE email_sent_at IS NOT NULL
GROUP BY email_status;
*/


