# Automated Emails List - IDAIC Portal

This document lists all automated emails sent by the IDAIC portal system to admin and idaic.org addresses.

## Email Configuration

### Default Email Addresses
- **From Email (Default):** `IDAIC Events <no-reply@idaic.nexusclimate.co>`
- **Reply-To (Default):** `info@idaic.org`
- **Welcome Email From:** `IDAIC Welcome <no-reply@idaic.nexusclimate.co>`
- **Organizer Email (Default):** `info@idaic.org`
- **Admin Email (Fallback):** `admin@idaic.org`

### Environment Variables Used
```
FROM_EMAIL (default: IDAIC Events <no-reply@idaic.nexusclimate.co>)
REPLY_TO (default: info@idaic.org)
ORGANIZER_EMAIL (default: info@idaic.org)
RESEND_API_KEY
```

---

## 1. Welcome Emails

**File:** `netlify/functions/sendWelcomeEmail.js`

**Trigger:** Manual only (via "Send Welcome Email" button in UserFormView)

**Recipients:** New members who have been approved

**From:** `IDAIC Welcome <no-reply@idaic.nexusclimate.co>`

**Reply-To:** `info@idaic.org`

**Subject:** `Welcome to IDAIC Members Portal - Beta Program`

**Content:**
- Welcome message
- Portal features (Specific Content, Events, Collaboration Projects)
- Link to members portal: `https://idaic.nexusclimate.co`
- Contact info: `info@idaic.org`
- Footer with IDAIC logo

**Notes:**
- This is NEVER sent automatically on user creation/approval
- Must be manually triggered by admin
- Updates `welcome_email_sent` field in users table

---

## 2. Event Registration Confirmation Emails

**File:** `netlify/functions/eventRegistrations.js`

**Trigger:** When a user registers for an event (automatic)

**Recipients:** Event registrants

**From:** `IDAIC Events <no-reply@idaic.nexusclimate.co>` (configurable via FROM_EMAIL env var)

**Reply-To:** `info@idaic.org` (configurable via REPLY_TO env var)

**Subject:** `Registration Confirmed: [Event Title]`

**Content:**
- Event details (title, date/time in GST, location)
- Event description (first 200 chars)
- Calendar invitation (.ics file) as attachment
- Cancellation link
- Organizer email: `info@idaic.org` (or ORGANIZER_EMAIL env var)

**Attachments:**
- `.ics` calendar file (if event has a date)

**Notes:**
- Sent automatically on event registration
- Non-blocking (registration succeeds even if email fails)
- Generates unique cancellation token

---

## 3. Event Reminder Emails

**File:** `netlify/functions/sendEventReminders.js`

**Trigger:** Scheduled/cron job or manual POST request

**Recipients:** All active event registrants (excluding cancelled registrations)

**From:** `IDAIC Events <no-reply@idaic.nexusclimate.co>`

**Reply-To:** `info@idaic.org`

**Subject:** `Reminder: [Event Title] - X day(s) away`

**Content:**
- Event reminder notice
- Event details (title, date/time in GST, location)
- Event description (first 200 chars)
- Calendar invitation (.ics file) as attachment
- Cancellation link (if available)
- Organizer email: `info@idaic.org`

**Attachments:**
- `.ics` calendar file (if event has a date)

**Configuration:**
- `enable_reminders` flag on event
- `reminder_days_before` (default: 1 day)
- `reminder_hour` (default: 9 AM)

**Notes:**
- Only sends during specific hour window
- Sends to all non-cancelled registrations
- Timezone: Asia/Dubai (GST)

---

## 4. Slack Notifications (Not Email)

**File:** `netlify/functions/notifySlackPollClosed.js`

**Trigger:** When a poll is closed

**Recipients:** Slack channel (not email)

**Configuration:** Requires `SLACK_WEBHOOK_URL` environment variable

**Content:**
- Poll results with vote counts for each time slot
- Event title
- Formatted dates in GST timezone

**Notes:**
- This sends to Slack, not email
- Can be disabled by not setting SLACK_WEBHOOK_URL

---

## 5. Feedback/Contact Form Submissions (Not Direct Email)

**File:** `netlify/functions/createFeedbackTask.js`

**Trigger:** When feedback form is submitted

**Recipients:** Creates Linear issue (not direct email, but Linear may send notifications to team members)

**Configuration:** Requires:
- `LINEAR_API_KEY`
- `LINEAR_TEAM_ID`
- `LINEAR_TRIAGE_STATE_ID`
- `LINEAR_PROJECT_ID`

**Content:**
- Creates issue in Linear project management tool
- Includes: name, email, subject, type, comment, attachments

**Notes:**
- Does NOT send direct emails
- Linear may send notifications to configured team members
- Feedback form is in `portal/src/pages/Feedback.jsx`

---

## References to idaic.org Emails in Codebase

### Email Templates
All email templates include footer with:
```
This email was sent from IDAIC Welcome (no-reply@idaic.nexusclimate.co)
Please reply to info@idaic.org for any inquiries
© [Year] idaic.org. All rights reserved.
```

### Links and References
- Portal URL: `https://idaic.nexusclimate.co`
- Support contact: `info@idaic.org`
- Admin fallback: `admin@idaic.org` (used in App.jsx for password login)
- Event page references: `https://www.idaic.org/`

---

## Email Service Configuration

**Provider:** Resend (https://resend.com)

**API Configuration:**
- API Key: `RESEND_API_KEY` environment variable
- API Endpoint: `https://api.resend.com/emails`

**Fallback Behavior:**
- If `RESEND_API_KEY` is not set, emails are logged to console
- No emails are actually sent in this mode

---

## Summary

### Emails TO Members:
1. ✅ **Welcome Email** - Manual only (to new approved members)
2. ✅ **Event Registration Confirmation** - Automatic (to event registrants)
3. ✅ **Event Reminders** - Scheduled (to event registrants, X days before event)

### Emails TO Admin/IDAIC Team:
- ❌ **None directly** - Feedback goes to Linear, which may send notifications
- ℹ️ All member emails have reply-to: `info@idaic.org`

### Non-Email Notifications:
1. 🔔 **Slack Poll Results** - Sent to Slack channel when poll closes
2. 📋 **Feedback Submissions** - Creates Linear issues (Linear may notify team)

### All IDAIC.org Email Addresses Referenced:
- `info@idaic.org` - Main contact/reply-to address and fallback for password login
- `no-reply@idaic.nexusclimate.co` - Sender address for automated emails
