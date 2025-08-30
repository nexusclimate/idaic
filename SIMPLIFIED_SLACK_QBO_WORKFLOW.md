# Simplified Slack <> QBO Workflow

## 🎯 Simplified Approach Options

You're absolutely right! We can make this much simpler by eliminating Supabase and going either:
1. **Direct Slack → QBO** (minimal components)
2. **N8N-mediated workflow** (no-code/low-code solution)

## 🚀 Option 1: Direct Slack → QBO Integration

### Simplified Architecture

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│    SLACK    │    │   LIGHTWEIGHT   │    │  QUICKBOOKS │
│             │    │   PROCESSOR     │    │   ONLINE    │
│ 📱 Receipt  │───►│                 │───►│             │
│   Upload    │    │ • OCR Service   │    │ 💼 Expense  │
│             │    │ • Vendor Match  │    │   Creation  │
│ 💬 Status   │◄───│ • QBO API       │    │             │
│   Updates   │    │                 │    │ 📊 Vendor   │
│             │    │                 │    │   Database  │
└─────────────┘    └─────────────────┘    └─────────────┘
```

### Core Components (3 simple functions)

```javascript
// 1. Slack webhook handler
exports.slackReceiptHandler = async (event) => {
  const { file, user, channel } = event.body.event;
  
  // Download receipt from Slack
  const receiptBuffer = await downloadSlackFile(file.url_private);
  
  // Process with OCR
  const extractedData = await processReceiptOCR(receiptBuffer);
  
  // Send to QBO processor
  const result = await processToQBO(extractedData, file);
  
  // Send status back to Slack
  await sendSlackUpdate(channel, user, result);
};

// 2. OCR and QBO processor
async function processToQBO(extractedData, fileInfo) {
  // Match vendor in QBO
  const vendor = await matchOrCreateVendor(extractedData.vendor);
  
  // Create expense in QBO
  const expense = await createQBOExpense({
    vendor_id: vendor.id,
    amount: extractedData.amount,
    date: extractedData.date,
    receipt_attachment: fileInfo
  });
  
  return { success: true, expense_id: expense.id, vendor: vendor.name };
}

// 3. Slack notification sender
async function sendSlackUpdate(channel, user, result) {
  const message = result.success 
    ? `✅ Receipt processed! Expense created for ${result.vendor} - $${result.amount}`
    : `❌ Processing failed: ${result.error}`;
    
  await postSlackMessage(channel, message);
}
```

## 🔧 Option 2: N8N Workflow (Recommended)

### Why N8N is Perfect for This

- **No-code/low-code** solution
- **Built-in Slack and QBO nodes**
- **OCR integrations** available
- **Visual workflow designer**
- **Self-hosted or cloud options**

### N8N Workflow Design

```json
{
  "name": "Slack Receipt to QBO",
  "nodes": [
    {
      "name": "Slack File Upload Trigger",
      "type": "n8n-nodes-base.slackTrigger",
      "parameters": {
        "events": ["file_shared"],
        "channel": "#receipts"
      }
    },
    {
      "name": "Download Receipt File",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{ $node['Slack File Upload Trigger'].json.file.url_private }}",
        "headers": {
          "Authorization": "Bearer {{ $credentials.slackApi.accessToken }}"
        }
      }
    },
    {
      "name": "OCR Processing",
      "type": "n8n-nodes-base.googleCloudVision",
      "parameters": {
        "operation": "textDetection",
        "image": "={{ $node['Download Receipt File'].binary.data }}"
      }
    },
    {
      "name": "Extract Receipt Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": `
          const text = $input.first().json.textAnnotations[0].description;
          
          // Extract vendor (first line usually)
          const lines = text.split('\\n').filter(line => line.trim());
          const vendor = lines[0]?.trim();
          
          // Extract amount (look for currency patterns)
          const amountMatch = text.match(/\\$?([0-9,]+\\.?[0-9]*)/);
          const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
          
          // Extract date (various date patterns)
          const dateMatch = text.match(/([0-9]{1,2}[\/\\-][0-9]{1,2}[\/\\-][0-9]{2,4})/);
          const date = dateMatch ? new Date(dateMatch[1]) : new Date();
          
          return [{
            vendor: vendor,
            amount: amount,
            date: date.toISOString().split('T')[0],
            raw_text: text
          }];
        `
      }
    },
    {
      "name": "Search QBO Vendors",
      "type": "n8n-nodes-base.quickBooksOnline",
      "parameters": {
        "operation": "get",
        "resource": "vendor",
        "filters": {
          "Name": "={{ $node['Extract Receipt Data'].json.vendor }}"
        }
      }
    },
    {
      "name": "Create Vendor if Not Found",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $node['Search QBO Vendors'].json.QueryResponse?.Vendor?.length }}",
              "operation": "equal",
              "value2": "0"
            }
          ]
        }
      }
    },
    {
      "name": "Create New Vendor",
      "type": "n8n-nodes-base.quickBooksOnline",
      "parameters": {
        "operation": "create",
        "resource": "vendor",
        "name": "={{ $node['Extract Receipt Data'].json.vendor }}"
      }
    },
    {
      "name": "Create QBO Expense",
      "type": "n8n-nodes-base.quickBooksOnline",
      "parameters": {
        "operation": "create",
        "resource": "purchase",
        "vendorRef": "={{ $node['Search QBO Vendors'].json.QueryResponse?.Vendor?.[0]?.Id || $node['Create New Vendor'].json.Vendor.Id }}",
        "totalAmt": "={{ $node['Extract Receipt Data'].json.amount }}",
        "txnDate": "={{ $node['Extract Receipt Data'].json.date }}"
      }
    },
    {
      "name": "Send Slack Confirmation",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "operation": "postMessage",
        "channel": "={{ $node['Slack File Upload Trigger'].json.channel }}",
        "text": "✅ Receipt processed! Expense created for {{ $node['Extract Receipt Data'].json.vendor }} - ${{ $node['Extract Receipt Data'].json.amount }}"
      }
    }
  ]
}
```

## 🛠️ Implementation Comparison

### Direct Integration (Custom Code)
**Pros:**
- Full control over logic and error handling
- Can leverage existing Netlify Functions infrastructure
- Custom OCR and matching algorithms
- Detailed logging and analytics

**Cons:**
- More development time
- Need to handle QBO OAuth flow
- Custom error handling and retry logic
- Maintenance overhead

**Estimated Time:** 4-6 weeks

### N8N Integration (Recommended)
**Pros:**
- **Much faster implementation** (1-2 weeks)
- Visual workflow designer
- Built-in error handling and retries
- Pre-built Slack and QBO connectors
- Easy to modify and extend
- Self-hosted or cloud options

**Cons:**
- Less customization for complex logic
- Additional service to maintain
- Potential licensing costs for cloud version

**Estimated Time:** 1-2 weeks

## 🏆 Recommended Approach: N8N Workflow

### Quick Setup Steps

1. **Install N8N**
   ```bash
   npm install n8n -g
   # or use Docker
   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
   ```

2. **Configure Credentials**
   - Slack Bot Token (with file access permissions)
   - QBO OAuth credentials
   - OCR service API key (Google Vision, AWS Textract, or Azure)

3. **Import Workflow**
   - Use the JSON workflow provided above
   - Configure the Slack trigger for your receipts channel
   - Set up QBO connection with proper scopes

4. **Test & Deploy**
   - Test with sample receipts
   - Configure error notifications
   - Deploy to production

### Enhanced N8N Workflow Features

```javascript
// Advanced vendor matching in N8N Code node
const vendorName = $node['Extract Receipt Data'].json.vendor.toLowerCase();
const existingVendors = $node['Get All QBO Vendors'].json.QueryResponse?.Vendor || [];

// Fuzzy matching function
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Find best vendor match
let bestMatch = null;
let bestScore = 0;

for (const vendor of existingVendors) {
  const score = calculateSimilarity(vendorName, vendor.Name.toLowerCase());
  if (score > bestScore && score > 0.8) { // 80% confidence threshold
    bestMatch = vendor;
    bestScore = score;
  }
}

return [{
  matched_vendor: bestMatch,
  confidence: bestScore,
  should_create_new: bestScore < 0.8
}];
```

## 📋 Simplified Data Flow

### Direct Slack → QBO (No Database)

```
1. Receipt uploaded to Slack #receipts channel
2. Slack webhook triggers N8N workflow
3. Download receipt file from Slack
4. OCR processing (Google Vision/AWS Textract)
5. Extract: vendor, amount, date, category
6. Search QBO vendors for exact/fuzzy match
7. Create vendor if no match found (>80% confidence)
8. Create expense/bill in QBO with receipt attachment
9. Send confirmation back to Slack
```

### Benefits of This Approach

✅ **No database maintenance**  
✅ **Direct API integration**  
✅ **Faster implementation**  
✅ **Lower infrastructure costs**  
✅ **Built-in error handling**  
✅ **Visual workflow management**  

## 🔄 N8N Workflow Configuration

### Required N8N Nodes
1. **Slack Trigger** - Listen for file uploads in #receipts
2. **HTTP Request** - Download receipt file
3. **Google Cloud Vision** - OCR processing
4. **Code Node** - Data extraction and vendor matching logic
5. **QuickBooks Online** - Vendor search/create
6. **QuickBooks Online** - Expense/Bill creation
7. **Slack** - Send confirmation message

### Environment Variables Needed
```bash
# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# QuickBooks Online
QBO_CLIENT_ID=your-qbo-app-client-id
QBO_CLIENT_SECRET=your-qbo-app-secret
QBO_REDIRECT_URI=your-oauth-redirect

# OCR Service (choose one)
GOOGLE_CLOUD_VISION_API_KEY=your-api-key
# OR
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

## 🎯 Minimal Viable Product (MVP)

### Week 1: Basic Setup
- N8N installation and configuration
- Slack app creation with file upload permissions
- QBO OAuth app setup

### Week 2: Core Workflow
- N8N workflow implementation
- Basic OCR integration
- Simple vendor matching (exact match only)
- QBO expense creation

### Optional Enhancements (Week 3+)
- Fuzzy vendor matching
- Category prediction
- Approval workflows for high amounts
- Receipt duplicate detection

This simplified approach eliminates the complexity of maintaining a separate database while still achieving the core objective of automating receipt processing from Slack to QBO.