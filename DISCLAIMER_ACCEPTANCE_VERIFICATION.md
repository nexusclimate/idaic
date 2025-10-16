# Disclaimer Acceptance Verification Guide

## How to Verify Disclaimer is Being Saved

### 1. Check Browser Console

When you accept the disclaimer, you should see these logs:

**Success:**
```
💾 Saving disclaimer acceptance for user: { userId: "xxx-xxx-xxx", email: "user@example.com" }
✅ Disclaimer acceptance recorded in database: { success: true, acceptedAt: "2024-10-16T...", updatedUser: {...} }
```

**Error (but still saved to localStorage):**
```
❌ Failed to record disclaimer acceptance in database: { status: 404, error: {...} }
✅ Disclaimer saved to localStorage as fallback
```

### 2. Check Database Directly

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'disclaimer_accepted_at';
```

Expected result: Should show one row with `disclaimer_accepted_at` column

### 3. Check Your User's Disclaimer Status

```sql
-- Replace with your actual email
SELECT 
  email,
  name,
  disclaimer_accepted_at,
  CASE 
    WHEN disclaimer_accepted_at IS NULL THEN 'Never accepted'
    WHEN disclaimer_accepted_at > NOW() - INTERVAL '90 days' THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM users
WHERE email = 'your-email@example.com';
```

### 4. Check All Users' Disclaimer Status

```sql
SELECT 
  email,
  disclaimer_accepted_at,
  CASE 
    WHEN disclaimer_accepted_at IS NULL THEN '❌ Never'
    WHEN disclaimer_accepted_at > NOW() - INTERVAL '90 days' THEN '✅ Valid'
    ELSE '⚠️ Expired'
  END as status
FROM users
ORDER BY disclaimer_accepted_at DESC NULLS LAST;
```

## Common Issues and Solutions

### Issue 1: Column doesn't exist

**Symptom:** Error in console: "column 'disclaimer_accepted_at' does not exist"

**Solution:** Run this SQL:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS disclaimer_accepted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_disclaimer_accepted_at 
ON users(disclaimer_accepted_at);
```

### Issue 2: User not found in database

**Symptom:** Console shows "User not found" or 404 error

**Solution:** Check if user exists:
```sql
SELECT id, email, name FROM users WHERE email = 'your-email@example.com';
```

If user doesn't exist, they need to be added to the users table first.

### Issue 3: Disclaimer shows every time

**Symptom:** Disclaimer popup appears on every page refresh

**Possible Causes:**
1. Database column doesn't exist
2. Function is failing to save
3. Function is not deployed

**Solution:**
1. Check browser console for errors
2. Run SQL to verify column exists
3. Deploy the disclaimerAcceptance function to Netlify

### Issue 4: Using localStorage only

**Symptom:** Console shows "Using localStorage fallback"

**Cause:** Database save is failing, but localStorage is working

**Solution:**
1. Check Netlify function logs
2. Verify SUPABASE_SERVICE_ROLE_KEY is set
3. Check if disclaimerAcceptance function is deployed

## Testing the Flow

### Test 1: Fresh User (Never Accepted)

1. **Clear localStorage**
   ```javascript
   // In browser console
   localStorage.removeItem('idaic-disclaimer-accepted');
   ```

2. **Clear database (optional)**
   ```sql
   UPDATE users 
   SET disclaimer_accepted_at = NULL 
   WHERE email = 'your-email@example.com';
   ```

3. **Refresh page**
   - Disclaimer should appear

4. **Scroll to bottom and click "I Accept"**
   - Check console for success message
   - Check database for timestamp

5. **Refresh page again**
   - Disclaimer should NOT appear

### Test 2: Expired Disclaimer (Over 90 Days)

1. **Set disclaimer to 91 days ago**
   ```sql
   UPDATE users 
   SET disclaimer_accepted_at = NOW() - INTERVAL '91 days'
   WHERE email = 'your-email@example.com';
   ```

2. **Clear localStorage**
   ```javascript
   localStorage.removeItem('idaic-disclaimer-accepted');
   ```

3. **Refresh page**
   - Disclaimer should appear again

4. **Accept it**
   - New timestamp should be saved

### Test 3: Valid Disclaimer (Within 90 Days)

1. **Ensure recent acceptance**
   ```sql
   UPDATE users 
   SET disclaimer_accepted_at = NOW()
   WHERE email = 'your-email@example.com';
   ```

2. **Refresh page**
   - Disclaimer should NOT appear

## Netlify Function Check

### Check if function is deployed

1. Go to Netlify Dashboard
2. Navigate to Functions
3. Look for `disclaimerAcceptance`
4. Check the logs for any errors

### Test the function directly

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/disclaimerAcceptance \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-uuid",
    "email": "your-email@example.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "acceptedAt": "2024-10-16T12:34:56.789Z",
  "updatedUser": {
    "id": "...",
    "email": "...",
    "disclaimer_accepted_at": "2024-10-16T12:34:56.789Z"
  }
}
```

## Environment Variables

Verify these are set in Netlify:

1. Go to Netlify Dashboard
2. Site configuration → Environment variables
3. Check for:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Database Permissions

If you're using Row Level Security (RLS), make sure the SERVICE_ROLE_KEY can update the users table:

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

Note: SERVICE_ROLE_KEY bypasses RLS, so this should not be an issue.

## Quick Verification Checklist

- [ ] `disclaimer_accepted_at` column exists in users table
- [ ] User exists in users table
- [ ] `disclaimerAcceptance` function is deployed to Netlify
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify
- [ ] Browser console shows success message when accepting
- [ ] Database shows timestamp after accepting
- [ ] Disclaimer doesn't show on next login (within 90 days)

## Manual Fix (If All Else Fails)

If the automated system isn't working, you can manually set disclaimers:

```sql
-- Set for all users
UPDATE users 
SET disclaimer_accepted_at = NOW();

-- Set for specific user
UPDATE users 
SET disclaimer_accepted_at = NOW()
WHERE email = 'user@example.com';

-- Set to expire in 30 days (for testing)
UPDATE users 
SET disclaimer_accepted_at = NOW() - INTERVAL '60 days'
WHERE email = 'user@example.com';
```

## What Should Happen

### First Login Ever
1. User logs in
2. Disclaimer popup appears
3. User scrolls to bottom
4. User clicks "I Accept"
5. `disclaimer_accepted_at` set to NOW()
6. Popup closes
7. User can use portal

### Login Within 90 Days
1. User logs in
2. System checks database
3. Sees recent acceptance (< 90 days)
4. Skips disclaimer
5. User goes straight to portal

### Login After 90 Days
1. User logs in
2. System checks database
3. Sees old acceptance (> 90 days)
4. Shows disclaimer again
5. User accepts
6. New timestamp saved
7. Cycle repeats

## Support Information

If you need help debugging, share:
1. Browser console logs when accepting disclaimer
2. SQL query results showing your user's disclaimer status
3. Netlify function logs (if accessible)
4. Any error messages from the browser or server

