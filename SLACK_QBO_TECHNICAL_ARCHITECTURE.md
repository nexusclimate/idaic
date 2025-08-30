# Slack <> QBO Technical Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     SLACK       │    │   PROCESSING    │    │   QUICKBOOKS    │
│                 │    │     LAYER       │    │     ONLINE      │
│  📱 Receipt     │    │                 │    │                 │
│     Upload      │◄──►│  🔄 Workflow    │◄──►│  💼 Expense     │
│                 │    │     Engine      │    │     Creation    │
│  💬 Status      │    │                 │    │                 │
│     Updates     │    │  🤖 AI/OCR      │    │  📊 Vendor      │
│                 │    │     Service     │    │     Matching    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   SUPABASE      │
                    │   DATABASE      │
                    │                 │
                    │  📋 Receipts    │
                    │  👥 Vendors     │
                    │  ⚙️  Settings   │
                    │  📈 Analytics   │
                    └─────────────────┘
```

## 🔄 Detailed Workflow Components

### 1. Slack Integration Layer

```typescript
// Slack webhook handler
interface SlackReceiptEvent {
  channel_id: string;
  user_id: string;
  file: {
    id: string;
    name: string;
    mimetype: string;
    url_private: string;
    size: number;
  };
  text?: string; // Optional description
  timestamp: string;
}

// Slack bot commands
const SLACK_COMMANDS = {
  '/receipt-status': 'Check processing status',
  '/receipt-help': 'Show help information',
  '/receipt-settings': 'Configure user preferences'
};
```

### 2. Receipt Processing Pipeline

```typescript
interface ReceiptProcessingPipeline {
  stages: [
    'file_validation',    // Check file type, size, format
    'ocr_extraction',     // Extract text and data
    'data_parsing',       // Parse vendor, amount, date
    'vendor_matching',    // Match against QBO vendors
    'qbo_integration',    // Create expense in QBO
    'notification'        // Send status back to Slack
  ];
}

interface ExtractedReceiptData {
  vendor: {
    name: string;
    confidence: number;
    alternatives?: string[];
  };
  amount: {
    total: number;
    tax?: number;
    currency: string;
    confidence: number;
  };
  date: {
    transaction_date: Date;
    confidence: number;
  };
  category: {
    suggested: string;
    confidence: number;
    alternatives?: string[];
  };
  line_items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
}
```

### 3. Vendor Matching Algorithm

```typescript
interface VendorMatchingService {
  // Exact match
  findExactMatch(vendorName: string): Promise<QBOVendor | null>;
  
  // Fuzzy matching with confidence scoring
  findFuzzyMatches(vendorName: string): Promise<Array<{
    vendor: QBOVendor;
    confidence: number;
    matchType: 'phonetic' | 'levenshtein' | 'partial';
  }>>;
  
  // Machine learning based matching
  findMLMatches(receiptData: ExtractedReceiptData): Promise<Array<{
    vendor: QBOVendor;
    confidence: number;
    factors: string[];
  }>>;
}

// Matching strategies
const MATCHING_STRATEGIES = {
  EXACT: 'exact_string_match',
  FUZZY: 'levenshtein_distance',
  PHONETIC: 'soundex_metaphone',
  PARTIAL: 'substring_matching',
  ML_PATTERN: 'machine_learning_patterns'
};
```

### 4. QBO Integration Service

```typescript
interface QBOIntegrationService {
  // Authentication
  authenticate(orgId: string): Promise<QBOConnection>;
  refreshToken(connection: QBOConnection): Promise<void>;
  
  // Vendor operations
  getVendors(): Promise<QBOVendor[]>;
  createVendor(vendorData: VendorCreateRequest): Promise<QBOVendor>;
  
  // Expense operations
  createExpense(expenseData: ExpenseCreateRequest): Promise<QBOExpense>;
  attachReceipt(expenseId: string, receiptFile: File): Promise<void>;
  
  // Account and category mapping
  getChartOfAccounts(): Promise<QBOAccount[]>;
  mapCategoryToAccount(category: string): Promise<QBOAccount>;
}

interface QBOExpenseCreateRequest {
  vendor_id: string;
  amount: number;
  transaction_date: Date;
  account_id: string;
  description: string;
  receipt_attachment?: {
    file_name: string;
    file_data: Buffer;
    mime_type: string;
  };
  line_items?: Array<{
    account_id: string;
    amount: number;
    description: string;
  }>;
}
```

## 🔧 Implementation Architecture

### Netlify Functions Structure

```
netlify/functions/
├── slack-receipt-webhook.js      # Handle Slack file uploads
├── process-receipt.js            # OCR and data extraction
├── match-vendor.js               # Vendor matching logic
├── create-qbo-expense.js         # QBO expense creation
├── qbo-auth.js                   # QBO OAuth handling
├── receipt-status.js             # Status checking
└── slack-notifications.js       # Send updates to Slack
```

### Database Schema Implementation

```sql
-- Enhanced receipts table with processing stages
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    org_id UUID REFERENCES orgs(id),
    
    -- Slack metadata
    slack_message_id TEXT NOT NULL,
    slack_channel_id TEXT NOT NULL,
    slack_user_id TEXT NOT NULL,
    
    -- File information
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Processing status
    processing_status TEXT DEFAULT 'pending',
    processing_stages JSONB DEFAULT '{}',
    error_details JSONB,
    
    -- Extracted data
    ocr_raw_text TEXT,
    extracted_data JSONB,
    confidence_scores JSONB,
    
    -- QBO integration
    qbo_transaction_id TEXT,
    qbo_vendor_id TEXT,
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_receipts_user_status (user_id, processing_status),
    INDEX idx_receipts_slack_msg (slack_message_id),
    INDEX idx_receipts_created (created_at DESC)
);

-- Vendor matching with learning capabilities
CREATE TABLE vendor_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id),
    
    -- Extracted vendor information
    extracted_vendor_name TEXT NOT NULL,
    extracted_vendor_variations TEXT[], -- Common variations found
    
    -- QBO vendor match
    qbo_vendor_id TEXT,
    qbo_vendor_name TEXT,
    
    -- Matching details
    match_strategy TEXT NOT NULL, -- exact, fuzzy, ml, manual
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    match_factors JSONB, -- What led to this match
    
    -- User feedback
    user_confirmed BOOLEAN DEFAULT FALSE,
    user_feedback TEXT,
    
    -- Learning data
    is_training_data BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    
    INDEX idx_vendor_matches_receipt (receipt_id),
    INDEX idx_vendor_matches_vendor (qbo_vendor_id),
    INDEX idx_vendor_matches_confidence (confidence_score DESC)
);

-- Processing rules for automation
CREATE TABLE processing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id),
    
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- vendor_auto_match, category_mapping, approval_threshold
    
    -- Rule conditions (JSON query format)
    conditions JSONB NOT NULL,
    -- Rule actions (what to do when conditions match)
    actions JSONB NOT NULL,
    
    -- Rule metadata
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_processing_rules_org_active (org_id, is_active),
    INDEX idx_processing_rules_type (rule_type)
);
```

### API Endpoint Specifications

```typescript
// Slack webhook endpoint
POST /slack/receipt-webhook
{
  "token": "verification_token",
  "team_id": "T1234567890",
  "event": {
    "type": "message",
    "subtype": "file_share",
    "file": {
      "id": "F1234567890",
      "name": "receipt.jpg",
      "mimetype": "image/jpeg",
      "url_private": "https://files.slack.com/...",
      "size": 1024000
    },
    "channel": "C1234567890",
    "user": "U1234567890",
    "ts": "1234567890.123456"
  }
}

// Receipt processing status
GET /receipt/{receipt_id}/status
Response: {
  "id": "uuid",
  "status": "processing",
  "stage": "vendor_matching",
  "progress": 60,
  "extracted_data": {
    "vendor": "ACME Corp",
    "amount": 125.50,
    "date": "2024-01-15"
  },
  "vendor_matches": [
    {
      "vendor_name": "ACME Corporation",
      "confidence": 0.95,
      "qbo_vendor_id": "123"
    }
  ]
}

// Manual vendor selection
POST /receipt/{receipt_id}/confirm-vendor
{
  "qbo_vendor_id": "123",
  "create_new": false,
  "vendor_data": {
    "name": "ACME Corporation",
    "email": "billing@acme.com"
  }
}
```

## 🤖 Machine Learning Enhancement

### Training Data Collection

```typescript
interface MLTrainingData {
  receipt_image: Buffer;
  ocr_text: string;
  confirmed_vendor: {
    qbo_vendor_id: string;
    vendor_name: string;
  };
  user_corrections: {
    field: string;
    original_value: string;
    corrected_value: string;
  }[];
  processing_metadata: {
    confidence_scores: Record<string, number>;
    processing_time: number;
    user_satisfaction: number; // 1-5 rating
  };
}
```

### Vendor Matching ML Model

```python
# Pseudo-code for vendor matching model
class VendorMatchingModel:
    def __init__(self):
        self.feature_extractors = [
            TextSimilarityExtractor(),
            PhoneticSimilarityExtractor(),
            HistoricalPatternExtractor(),
            LocationBasedExtractor()
        ]
        
    def predict_vendor_match(self, receipt_data, vendor_candidates):
        features = self.extract_features(receipt_data, vendor_candidates)
        probabilities = self.model.predict_proba(features)
        return self.rank_candidates(vendor_candidates, probabilities)
    
    def learn_from_feedback(self, receipt_id, user_selection):
        # Update model based on user corrections
        training_sample = self.create_training_sample(receipt_id, user_selection)
        self.model.partial_fit([training_sample])
```

## 📊 Monitoring and Analytics

### Key Performance Indicators

```typescript
interface ProcessingMetrics {
  daily_receipts_processed: number;
  average_processing_time: number; // seconds
  vendor_match_accuracy: number; // percentage
  user_intervention_rate: number; // percentage
  qbo_integration_success_rate: number; // percentage
  cost_per_receipt: number; // processing cost
}

interface UserExperienceMetrics {
  user_satisfaction_score: number; // 1-5 scale
  time_saved_vs_manual: number; // minutes
  error_rate: number; // percentage
  feature_adoption_rate: Record<string, number>;
}
```

### Error Handling and Monitoring

```typescript
interface ErrorHandlingStrategy {
  ocr_failures: 'retry_with_different_engine';
  vendor_match_low_confidence: 'request_user_input';
  qbo_api_errors: 'retry_with_exponential_backoff';
  file_processing_errors: 'notify_user_and_admin';
}

interface MonitoringAlerts {
  high_error_rate: 'alert_if_error_rate_above_5_percent';
  processing_delays: 'alert_if_average_time_above_5_minutes';
  qbo_integration_issues: 'alert_immediately';
  user_complaints: 'alert_within_1_hour';
}
```

This technical architecture provides a robust foundation for implementing the Slack <> QBO workflow with proper error handling, monitoring, and scalability considerations.