# Quick Setup Guide: Slack → QBO Receipt Automation

## 🚀 5-Step Quick Setup (N8N Approach)

### Step 1: Install N8N (5 minutes)

**Option A: Docker (Recommended)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: NPM**
```bash
npm install n8n -g
n8n start
```

Access N8N at: `http://localhost:5678`

### Step 2: Create Slack App (10 minutes)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name: "Receipt Processor"
4. Select your workspace

**Configure Bot Permissions:**
- `files:read` - Read uploaded files
- `chat:write` - Send confirmation messages
- `channels:history` - Read channel messages

**Enable Events:**
- Request URL: `http://your-n8n-url/webhook/slack`
- Subscribe to: `file_shared`

**Install App to Workspace**

### Step 3: Setup QBO OAuth App (10 minutes)

1. Go to [developer.intuit.com](https://developer.intuit.com)
2. Create new app → "QuickBooks Online"
3. Get Client ID and Client Secret
4. Set Redirect URI: `http://your-n8n-url/oauth/qbo/callback`

**Required Scopes:**
- `com.intuit.quickbooks.accounting` - Full accounting access

### Step 4: Configure N8N Credentials (5 minutes)

**In N8N Dashboard:**

1. **Slack API Credentials**
   - Bot User OAuth Token: `xoxb-your-token`
   - Signing Secret: `your-signing-secret`

2. **QuickBooks Online Credentials**
   - Client ID: `your-qbo-client-id`
   - Client Secret: `your-qbo-client-secret`
   - Complete OAuth flow to get access token

3. **Google Cloud Vision (for OCR)**
   - Service Account JSON key
   - Enable Vision API in Google Cloud Console

### Step 5: Import Workflow (2 minutes)

1. In N8N, click "Import from File"
2. Upload `N8N_WORKFLOW_CONFIG.json`
3. Configure credentials for each node
4. Activate workflow

## 🎯 Alternative: Direct Integration (15 minutes)

If you prefer a direct approach without N8N:

### Single Netlify Function Approach

```javascript
// netlify/functions/slack-to-qbo.js
const { WebClient } = require('@slack/web-api');
const QuickBooks = require('node-quickbooks');
const vision = require('@google-cloud/vision');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const slackEvent = JSON.parse(event.body);
  
  // Verify Slack signature
  if (!verifySlackSignature(event.headers, event.body)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // Handle file upload event
  if (slackEvent.event?.type === 'file_shared') {
    try {
      const result = await processReceipt(slackEvent.event);
      return { statusCode: 200, body: JSON.stringify(result) };
    } catch (error) {
      console.error('Processing error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  }

  return { statusCode: 200, body: 'OK' };
};

async function processReceipt(fileEvent) {
  // 1. Download file from Slack
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  const fileInfo = await slack.files.info({ file: fileEvent.file.id });
  const fileBuffer = await downloadFile(fileInfo.file.url_private);

  // 2. OCR processing
  const visionClient = new vision.ImageAnnotatorClient();
  const [result] = await visionClient.textDetection({ image: { content: fileBuffer } });
  const extractedText = result.textAnnotations?.[0]?.description || '';

  // 3. Parse receipt data
  const receiptData = parseReceiptText(extractedText);

  // 4. Match/create vendor in QBO
  const qbo = new QuickBooks(/* QBO config */);
  const vendor = await findOrCreateVendor(qbo, receiptData.vendor);

  // 5. Create expense in QBO
  const expense = await qbo.createPurchase({
    VendorRef: { value: vendor.Id },
    TotalAmt: receiptData.amount,
    TxnDate: receiptData.date,
    Line: [{
      Amount: receiptData.amount,
      DetailType: "AccountBasedExpenseLineDetail",
      AccountBasedExpenseLineDetail: {
        AccountRef: { value: "1" } // Default expense account
      }
    }]
  });

  // 6. Send confirmation to Slack
  await slack.chat.postMessage({
    channel: fileEvent.channel,
    thread_ts: fileEvent.ts,
    text: `✅ Receipt processed! Expense created for ${vendor.Name} - $${receiptData.amount}`
  });

  return { success: true, expense_id: expense.Id };
}

function parseReceiptText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract vendor (first meaningful line)
  const vendor = lines.find(line => line.length > 3 && !line.match(/^[0-9\s\$\.,]+$/))?.trim() || 'Unknown Vendor';
  
  // Extract amount (largest currency value)
  const amounts = text.match(/\$?([0-9,]+\.?[0-9]*)/g)
    ?.map(match => parseFloat(match.replace(/[\$,]/g, '')))
    .filter(num => !isNaN(num)) || [0];
  const amount = Math.max(...amounts);
  
  // Extract date
  const dateMatch = text.match(/([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/);
  const date = dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  return { vendor, amount, date };
}
```

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# QuickBooks Online  
QBO_CLIENT_ID=your-client-id
QBO_CLIENT_SECRET=your-client-secret
QBO_ACCESS_TOKEN=your-access-token
QBO_TOKEN_SECRET=your-token-secret
QBO_COMPANY_ID=your-company-id

# OCR Service
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Package Dependencies

```json
{
  "dependencies": {
    "@slack/web-api": "^6.8.0",
    "node-quickbooks": "^2.0.0",
    "@google-cloud/vision": "^3.0.0"
  }
}
```

## 📱 Slack Channel Setup

### Create Receipt Channel
1. Create `#receipts` channel in Slack
2. Add the Receipt Processor bot
3. Pin instructions message:

```
📄 **Receipt Processing Instructions**

1. Upload receipt image/PDF to this channel
2. Add optional description in the message
3. Bot will automatically:
   • Extract vendor and amount
   • Match with existing QBO vendors
   • Create expense entry
   • Send confirmation

**Supported formats:** JPG, PNG, PDF
**Max file size:** 10MB
```

## ⚡ Testing Workflow

### Test Receipt Upload
1. Upload a sample receipt to `#receipts`
2. Check N8N execution log
3. Verify expense created in QBO
4. Confirm Slack notification received

### Sample Test Message
```
"Just grabbed lunch at Joe's Diner - $15.50 for client meeting"
[attach receipt image]
```

Expected result:
- OCR extracts "Joe's Diner" and "$15.50"
- Creates/matches vendor in QBO
- Creates expense entry
- Slack confirms: "✅ Receipt processed! Expense created for Joe's Diner - $15.50"

## 🎯 Success Criteria

- ✅ Receipt uploaded to Slack
- ✅ OCR extracts vendor and amount (>80% accuracy)
- ✅ Vendor matched or created in QBO
- ✅ Expense entry created with receipt attachment
- ✅ Confirmation sent back to Slack
- ✅ Total processing time < 30 seconds

This simplified approach eliminates database complexity while achieving the core automation goal!