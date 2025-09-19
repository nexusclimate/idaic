# 🚀 Advanced Supabase Email Processing Setup

## Overview
This guide covers advanced Supabase features for automated email processing, real-time monitoring, and robust error handling.

## 🏗️ Architecture Components

### 1. Supabase Edge Functions
- **Location**: `supabase/functions/process-profile-emails/`
- **Purpose**: Serverless email processing close to your database
- **Benefits**: Lower latency, better performance, direct DB access

### 2. Database Triggers
- **Purpose**: Automatic notifications when new submissions are created
- **Benefits**: Real-time processing, audit logging

### 3. Webhooks
- **Purpose**: Trigger external processes when data changes
- **Benefits**: Flexible integrations, event-driven architecture

### 4. Real-time Subscriptions
- **Purpose**: Live monitoring of submission status
- **Benefits**: Instant UI updates, real-time dashboards

---

## 📋 Setup Steps

### Step 1: Deploy Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy process-profile-emails
```

### Step 2: Configure Environment Variables

In your Supabase dashboard:
1. Go to **Settings** > **Edge Functions**
2. Add environment variables:
   - `SENDGRID_API_KEY`
   - `NODE_ENV` (set to 'development' for testing)

### Step 3: Set Up Webhooks

#### Option A: Edge Function Webhook (Recommended)
1. Go to **Database** > **Webhooks** in Supabase Dashboard
2. Create new webhook:
   - **Name**: `Process Profile Emails`
   - **Table**: `user_profile_submissions`
   - **Events**: `INSERT`
   - **Type**: `Edge Function`
   - **Function**: `process-profile-emails`
   - **Conditions**: `email_status = 'pending'`

#### Option B: HTTP Webhook
1. Use the SQL in `supabase-webhook-setup.sql`
2. Configure your Netlify function URL

### Step 4: Test the Setup

```bash
# Test the edge function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/process-profile-emails' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

## 🔧 Advanced Features

### Real-time Monitoring Dashboard

```jsx
// Add to your React app for real-time updates
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const subscription = supabase
  .channel('email_processing')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'user_profile_submissions'
    },
    (payload) => {
      console.log('Submission updated:', payload)
      // Update your dashboard
    }
  )
  .subscribe()
```

### Batch Processing with Rate Limiting

```typescript
// In your edge function
const BATCH_SIZE = 5
const RATE_LIMIT_DELAY = 1000 // 1 second between emails

// Process in batches with delays
for (const submission of submissions) {
  await processEmail(submission)
  await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
}
```

### Error Handling & Retry Logic

```typescript
// Automatic retry for failed emails
const MAX_RETRIES = 3

async function sendEmailWithRetry(submission, attempt = 1) {
  try {
    await sendEmail(submission)
    // Mark as sent
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      return sendEmailWithRetry(submission, attempt + 1)
    }
    // Mark as failed
  }
}
```

---

## 📊 Monitoring & Analytics

### Database Queries for Monitoring

```sql
-- Recent submissions with status
SELECT
  ups.id,
  ups.email_status,
  ups.submitted_at,
  ups.email_sent_at,
  up.name,
  up.email
FROM user_profile_submissions ups
JOIN user_profiles up ON ups.user_profile_id = up.id
ORDER BY ups.submitted_at DESC
LIMIT 20;

-- Success rate over time
SELECT
  DATE(submitted_at) as date,
  COUNT(*) as total,
  COUNT(CASE WHEN email_status = 'sent' THEN 1 END) as sent,
  ROUND(
    COUNT(CASE WHEN email_status = 'sent' THEN 1 END)::decimal /
    COUNT(*)::decimal * 100, 2
  ) as success_rate
FROM user_profile_submissions
GROUP BY DATE(submitted_at)
ORDER BY date DESC;

-- Failed submissions for retry
SELECT * FROM user_profile_submissions
WHERE email_status = 'failed'
  AND (email_attempted_at IS NULL OR email_attempted_at < NOW() - INTERVAL '1 hour')
ORDER BY email_attempted_at ASC;
```

### Performance Metrics

```sql
-- Average processing time
SELECT
  AVG(EXTRACT(EPOCH FROM (email_sent_at - submitted_at))) as avg_seconds,
  MIN(EXTRACT(EPOCH FROM (email_sent_at - submitted_at))) as min_seconds,
  MAX(EXTRACT(EPOCH FROM (email_sent_at - submitted_at))) as max_seconds
FROM user_profile_submissions
WHERE email_status = 'sent';

-- Error analysis
SELECT
  email_error,
  COUNT(*) as count
FROM user_profile_submissions
WHERE email_status = 'failed'
GROUP BY email_error
ORDER BY count DESC;
```

---

## 🔒 Security Considerations

### Row Level Security (RLS)

```sql
-- Enable RLS on submissions table
ALTER TABLE user_profile_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for admin access
CREATE POLICY "Admin can view all submissions" ON user_profile_submissions
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy for users to view their own submissions
CREATE POLICY "Users can view own submissions" ON user_profile_submissions
  FOR SELECT USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
      WHERE user_id = auth.uid()
    )
  );
```

### Environment Variables

Store sensitive data securely:
- API keys in Supabase secrets
- Database credentials via connection pooling
- Email service credentials encrypted

---

## 🚀 Scaling Considerations

### Horizontal Scaling
- Multiple edge function instances
- Database connection pooling
- Rate limiting per user/service

### Vertical Scaling
- Increase edge function memory/CPU
- Database read replicas for monitoring
- CDN for static assets

### Cost Optimization
- Batch processing to reduce function calls
- Selective webhook triggers
- Archive old submissions

---

## 🐛 Troubleshooting

### Common Issues

1. **Webhook not triggering**
   - Check webhook configuration
   - Verify table permissions
   - Check Supabase logs

2. **Edge function timeout**
   - Increase timeout in function config
   - Optimize database queries
   - Add pagination for large datasets

3. **Email delivery failures**
   - Check email service API limits
   - Verify sender domain authentication
   - Monitor bounce rates

### Debugging Commands

```bash
# View edge function logs
supabase functions logs process-profile-emails

# Test database connection
supabase db test

# Check webhook status
supabase db webhooks list
```

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Webhooks Guide](https://supabase.com/docs/guides/database/webhooks)
- [Supabase Real-time Docs](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

## 🎯 Next Steps

1. **Deploy edge function** to your Supabase project
2. **Configure webhooks** in Supabase dashboard
3. **Set up monitoring dashboard** using the React component
4. **Test end-to-end flow** with a sample submission
5. **Configure alerts** for failed email deliveries
6. **Optimize performance** based on usage patterns

This advanced setup provides a production-ready, scalable email processing system with comprehensive monitoring and error handling! 🚀


