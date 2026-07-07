# LeadSense AI CSV Importer

Enterprise-grade **AI-powered CSV Importer** that intelligently converts arbitrary CSV files into a standardized CRM schema using AWS Bedrock (Claude 3.5 Sonnet) or other LLM providers.

---

## 🚀 Features

- **🤖 AI-Powered Mapping**: Automatically maps different CSV structures to CRM schema using LLMs
- **🔄 Flexible Import**: Handles different column names, missing columns, extra columns, and data variations
- **⚡ Batch Processing**: Processes large CSV files in optimized batches (10 records/batch)
- **✅ Validation**: Comprehensive data validation, normalization, and error handling
- **📊 Import History**: Track all imports with detailed logs and analytics
- **👨‍💼 Admin Dashboard**: Real-time analytics, monitoring, and lead exploration
- **📈 Real-time Progress**: Live progress updates with WebSocket support
- **🎯 Smart Field Mapping**: Handles multiple emails/phones, remarks, follow-ups intelligently
- **🏗️ Project Tracking**: Maps leads to specific real estate projects (data sources)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Frontend                            │
│  (Next.js 15) - Upload, Preview, Results, History, Dashboard    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend API                              │
│  (Node.js + Express + TypeScript)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CSV Pipeline:                                            │   │
│  │  1. Upload & Validation                                  │   │
│  │  2. CSV Parsing (csv-parser)                             │   │
│  │  3. Batch Processing (10 rows/batch)                     │   │
│  │  4. AI Extraction (AWS Bedrock / Claude 3.5)             │   │
│  │  5. CRM Normalization (phone, email, status, source)     │   │
│  │  6. Validation (Zod schemas)                             │   │
│  │  7. MongoDB Storage                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────┬──────────────────────────────────┬──────────────┘
                │                                   │
                ▼                                   ▼
        ┌──────────────┐                  ┌─────────────────┐
        │  AWS Bedrock │                  │  MongoDB Atlas  │
        │ Claude 3.5   │                  │  Leads + History│
        └──────────────┘                  └─────────────────┘
```

**Key Components:**
- **CSV Parser**: Streams large files efficiently using [`csv-parser`](https://www.npmjs.com/package/csv-parser)
- **AI Extractor**: Uses AWS Bedrock (Claude 3.5 Sonnet) with intelligent prompt engineering
- **CRM Normalizer**: Handles phone numbers, emails, dates, status mapping, data source detection
- **Batch Processor**: Processes 10 records at a time to stay within token limits
- **Import History**: Tracks every import with success/failure counts, processing time, AI provider used

---

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **AI Provider**: AWS Bedrock (Claude 3.5 Sonnet v2)
- **CSV Processing**: csv-parser
- **Validation**: Zod schemas
- **Logging**: Winston
- **File Upload**: Multer
- **Security**: JWT, Helmet, CORS, Rate Limiting

### Frontend (User)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Tables**: TanStack Table
- **File Upload**: React Dropzone
- **Animations**: Framer Motion

### Frontend (Admin)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Analytics**: Real-time dashboard with aggregations

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn
- **MongoDB** (local or MongoDB Atlas)
- **AWS Account** with Bedrock access (Claude 3.5 Sonnet v2 enabled)

---

### 1. Clone Repository

```bash
git clone https://github.com/Arju1234n/LeadSense-AI.git
cd LeadSense-AI
```

---

### 2. Install Dependencies

```bash
# Install all workspace dependencies (backend + frontends)
npm install
```

---

### 3. Set Up AWS Bedrock

#### Option A: AWS IAM User (Recommended for Development)

1. **Create IAM User:**
   - Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
   - Create new user: `bedrock-csv-importer`
   - Attach policy: `AmazonBedrockFullAccess` (or create custom policy for `bedrock:InvokeModel`)

2. **Generate Access Keys:**
   - Go to user → Security Credentials → Create Access Key
   - Download the CSV with `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

3. **Enable Bedrock Model:**
   - Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
   - Select region: `us-east-1` (or your preferred region)
   - Enable model: **Claude 3.5 Sonnet v2** (`anthropic.claude-3-5-sonnet-20241022-v2:0`)
   - Request access if needed (usually instant)

#### Option B: AWS CLI Profile

```bash
# Configure AWS CLI with profile
aws configure --profile groweasy
# Enter: AWS Access Key ID, Secret Key, Region (us-east-1), Output format (json)
```

---

### 4. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit [`backend/.env`](backend/.env):

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/groweasy-csv-importer
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/groweasy-csv?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS Bedrock Configuration
AI_PROVIDER=bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Configuration

```bash
cd ../user-frontend
cp .env.example .env
```

Edit [`user-frontend/.env`](user-frontend/.env):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
cd ../admin-frontend
cp .env.example .env
```

Edit [`admin-frontend/.env`](admin-frontend/.env):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 5. Start MongoDB

#### Option A: Local MongoDB with Docker

```bash
docker run -d -p 27017:27017 --name groweasy-mongo \
  -e MONGO_INITDB_DATABASE=groweasy-csv-importer \
  mongo:7
```

#### Option B: MongoDB Atlas (Cloud)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your IP (or `0.0.0.0/0` for development)
3. Create database user
4. Copy connection string to `MONGODB_URI` in `.env`

---

### 6. Start Development Servers

#### Option A: All Services at Once

```bash
# From root directory
npm run dev
```

This starts:
- **Backend API**: http://localhost:5000
- **User Frontend**: http://localhost:3001
- **Admin Frontend**: http://localhost:3002

#### Option B: Individual Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - User Frontend
cd user-frontend
npm run dev

# Terminal 3 - Admin Frontend
cd admin-frontend
npm run dev
```

---

### 7. Test the Import

1. Open **User Frontend**: http://localhost:3001
2. Upload the test CSV: [`test_leads.csv`](test_leads.csv)
3. Review the preview
4. Click "Start Import"
5. Watch the AI process the data in real-time!
6. View results with 10 successfully imported leads

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and start all services (backend + frontends + MongoDB)
npm run docker:up

# Stop all services
npm run docker:down

# Rebuild services after code changes
npm run docker:build

# View logs
docker-compose logs -f
```

Services:
- Backend: http://localhost:5000
- User Frontend: http://localhost:3001
- Admin Frontend: http://localhost:3002
- MongoDB: localhost:27017

---

## 📋 Sample CSV Formats

The AI can handle **any CSV structure**. Here are examples:

### Example 1: Real Estate Leads

```csv
Full Name,Email Address,Phone Number,Project Name,Status,Remarks
John Doe,john@example.com,+91-9876543210,Eden Park,Interested,Looking for 3BHK
Jane Smith,jane@example.com,+1-5551234567,Meridian Tower,Hot Lead,Wants corner unit
Bob Johnson,,+91-9999888877,Sarjapur Plots,Follow Up,Budget: 50L
```

### Example 2: Facebook Ads Leads

```csv
ad_id,ad_name,form_id,created_time,full_name,email,phone_number,city
123456,3BHK_Ad,789,2024-01-15T10:30:00Z,Alice Brown,alice@example.com,9876543210,Bangalore
```

### Example 3: Google Ads Leads

```csv
Lead ID,Campaign,Name,Email,Mobile,State,Comments
L001,Eden_Park_Search,David Lee,david@example.com,+919988776655,Karnataka,Interested in floor plan
```

### Example 4: Generic Contact List

```csv
Name,Contact Email,Mobile Number,Company Name,Location,Notes
Emily White,emily@company.com,+1-2125551234,Tech Corp,New York,Met at conference
```

**The AI automatically:**
- Maps columns to CRM fields (e.g., "Full Name" → `name`, "Phone Number" → `mobile`)
- Extracts country codes from phone numbers
- Normalizes email addresses
- Maps status values to the 4 allowed CRM statuses
- Detects project names (data sources)
- Consolidates remarks/notes into `crm_note`
- Handles multiple emails/phones (first → field, rest → `crm_note`)

---

## 🎯 CRM Schema & Field Mapping

### Target CRM Schema (MongoDB)

```typescript
{
  created_at: Date                    // Lead creation timestamp
  name: string                        // REQUIRED - contact name
  email?: string                      // Optional - validated email
  country_code?: string               // Optional - e.g., "+91", "+1"
  mobile_without_country_code?: string // Optional - digits only
  company?: string                    // Optional - company/organization
  city?: string                       // Optional - city name
  state?: string                      // Optional - state/province
  country?: string                    // Optional - country name
  lead_owner?: string                 // Optional - assigned sales rep
  crm_status: CRMStatus               // REQUIRED - one of 4 allowed values
  crm_note?: string                   // Optional - consolidated notes
  data_source: DataSource             // REQUIRED - project name or blank
  possession_time?: Date              // Optional - property handover date
  description?: string                // Optional - additional details
}
```

### CRM Status Values (CRITICAL)

| Status Value | Meaning | AI Mapping Examples |
|--------------|---------|---------------------|
| `GOOD_LEAD_FOLLOW_UP` | New/Hot/Qualified leads | "new", "interested", "hot", "qualified", "contacted", "follow up" |
| `DID_NOT_CONNECT` | Unreachable leads | "no answer", "busy", "not reachable", "pending", "unreachable" |
| `BAD_LEAD` | Dead/Invalid leads | "not interested", "lost", "rejected", "invalid", "junk", "dead" |
| `SALE_DONE` | Closed deals | "sold", "won", "closed", "converted", "deal closed" |

**Default**: If no status column exists, defaults to `GOOD_LEAD_FOLLOW_UP`

### Data Source Values (Real Estate Projects)

| Data Source | Project Name | AI Mapping Examples |
|-------------|--------------|---------------------|
| `leads_on_demand` | Leads on Demand | "leads on demand", "LOD", "leads" |
| `meridian_tower` | Meridian Tower | "meridian tower", "meridian", "tower" |
| `eden_park` | Eden Park | "eden park", "eden", "park" |
| `varah_swamy` | Varah Swamy | "varah swamy", "varah", "swamy" |
| `sarjapur_plots` | Sarjapur Plots | "sarjapur plots", "sarjapur", "plots" |
| `""` (blank) | Generic/No Project | If no project detected, left blank |

**DO NOT use "csv_import"** — that was an old mistake. The AI now intelligently detects real estate projects or leaves blank.

---

## 🔍 AI Prompt Engineering

The system uses carefully engineered prompts to ensure accurate mapping:

1. **Schema Definition**: AI receives the exact CRM schema with field types and constraints
2. **Enum Values**: Exact CRM status and data source values are provided (no hallucinations)
3. **Mapping Rules**:
   - Multiple emails/phones: First → field, rest → `crm_note`
   - Remarks/notes/follow-ups: All appended to `crm_note` with `|` separator
   - Phone normalization: Extract country code separately
   - Skip records: Missing both email AND mobile
4. **Output Format**: JSON array only, no markdown, no thinking, no explanations
5. **Validation**: AI output is validated against Zod schemas before DB insertion

See [`backend/src/services/ai/promptBuilder.service.ts`](backend/src/services/ai/promptBuilder.service.ts) for full prompts.

---

## 📊 Performance & Optimization

- **Batch Size**: 10 records per AI request (balances token usage and speed)
- **CSV Streaming**: Large files are streamed, not loaded into memory
- **Connection Pooling**: MongoDB connection pool for concurrent writes
- **Database Indexing**: Indexed on `email`, `mobile`, `created_at` for fast queries
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Size Limit**: 10MB default (configurable via `MAX_FILE_SIZE`)
- **Async Processing**: Non-blocking I/O for all operations

**Typical Performance:**
- 100 leads: ~30-45 seconds
- 1000 leads: ~4-6 minutes
- 10,000 leads: ~40-60 minutes

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Backend tests only
npm test --workspace=backend

# Frontend tests only
npm test --workspace=user-frontend
```

### Manual Testing

1. **Upload CSV**: Use [`test_leads.csv`](test_leads.csv) (10 test leads)
2. **Check AI Mapping**: Verify status values are correct (`GOOD_LEAD_FOLLOW_UP`, etc.)
3. **Check Data Source**: Verify `data_source` is one of the 5 allowed values or blank
4. **Multiple Contacts**: Upload CSV with multiple emails per row, verify extras go to `crm_note`
5. **Skip Logic**: Upload CSV with row missing both email and phone, verify it's skipped

---

## 📚 API Documentation

### Key Endpoints

#### Upload CSV
```bash
POST /api/csv/upload
Content-Type: multipart/form-data

Body: file (CSV file)
Response: { uploadId, fileName, fileSize }
```

#### Start Import
```bash
POST /api/csv/import/:uploadId
Response: { importId, totalRows, status: "processing" }
```

#### Get Import Status
```bash
GET /api/csv/import/:importId/status
Response: { status, progress, successCount, errorCount }
```

#### Get Import Results
```bash
GET /api/csv/import/:importId/results
Response: { leads: [...], skippedRecords: [...], summary }
```

See full API docs: [`docs/API.md`](docs/API.md) (coming soon)

---

## 🔐 Security

- **JWT Authentication**: Stateless token-based auth
- **Rate Limiting**: Prevents abuse (100 req/15min)
- **CORS Protection**: Whitelisted frontend origins
- **Input Validation**: Zod schemas validate all inputs
- **File Upload Security**: File type validation, size limits, sanitized filenames
- **Environment Variables**: Sensitive config never committed
- **Helmet.js**: Security headers (CSP, XSS protection, etc.)
- **MongoDB Injection Protection**: Mongoose escapes queries

---

## 🐛 Troubleshooting

### Issue: AWS Bedrock Access Denied

**Error**: `AccessDeniedException: User is not authorized to perform: bedrock:InvokeModel`

**Solution:**
1. Verify IAM user has `AmazonBedrockFullAccess` policy
2. Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`
3. Verify model is enabled in Bedrock console (us-east-1 region)
4. Try `aws bedrock list-foundation-models --region us-east-1` to test CLI access

### Issue: MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
1. Check MongoDB is running: `docker ps` or `mongosh`
2. Verify `MONGODB_URI` in `.env`
3. If using Atlas, whitelist your IP
4. Check firewall/network settings

### Issue: AI Returns Old Status Values

**Error**: Leads have status like `"new"`, `"contacted"` instead of `GOOD_LEAD_FOLLOW_UP`

**Solution:**
- This issue is now **FIXED** in [`promptBuilder.service.ts`](backend/src/services/ai/promptBuilder.service.ts)
- The AI now receives correct enum values
- CRM normalizer also maps old values via fuzzy matching in [`crmStatus.ts`](backend/src/constants/crmStatus.ts)

### Issue: Data Source Always "csv_import"

**Error**: All leads have `data_source: "csv_import"`

**Solution:**
- This issue is now **FIXED**
- AI now intelligently detects project names from CSV columns
- If no project match, `data_source` is left blank (`""`)

---

## 🎁 Bonus Features

- [x] ✅ AI-powered intelligent field mapping
- [x] ✅ Batch processing for large files
- [x] ✅ Real-time progress updates
- [x] ✅ Import history with analytics
- [x] ✅ Admin dashboard with charts
- [x] ✅ Dark mode support
- [x] ✅ Multiple email/phone handling
- [x] ✅ Project/data source detection
- [x] ✅ Fuzzy status mapping
- [x] ✅ Phone number normalization
- [x] ✅ Comprehensive error handling
- [x] ✅ Docker deployment
- [ ] 🚧 Webhook notifications (coming soon)
- [ ] 🚧 Export leads to Excel (coming soon)
- [ ] 🚧 Duplicate detection (coming soon)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - Copyright (c) 2026 Arju1234n

---

## 🆘 Support

For issues, questions, or feature requests:
- **GitHub Issues**: [Create an issue](https://github.com/Arju1234n/LeadSense-AI/issues)

---

**Built with ❤️ by Arju1234n**

**Last Updated**: July 2026 | **Version**: 1.0.0 | **Status**: ✅ Production Ready
