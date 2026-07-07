# Backend API - GrowEasy CSV Importer

Enterprise-grade backend API for AI-powered CSV importing.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   ├── env.ts           # Environment validation
│   │   └── ai.ts            # AI provider configuration
│   ├── controllers/         # Request handlers
│   │   ├── csv.controller.ts
│   │   ├── import.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/              # API routes
│   │   ├── csv.routes.ts
│   │   ├── import.routes.ts
│   │   └── admin.routes.ts
│   ├── services/            # Business logic
│   │   ├── csv/             # CSV processing
│   │   ├── ai/              # AI integration
│   │   └── crm/             # CRM mapping
│   ├── models/              # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Lead.ts
│   │   └── ImportHistory.ts
│   ├── middleware/          # Express middleware
│   │   ├── upload.ts
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   └── auth.ts
│   ├── utils/               # Utility functions
│   │   ├── phone.ts
│   │   ├── email.ts
│   │   ├── date.ts
│   │   ├── country.ts
│   │   └── logger.ts
│   ├── constants/           # Application constants
│   │   ├── crmStatus.ts
│   │   └── dataSource.ts
│   ├── types/               # TypeScript types
│   │   ├── crm.ts
│   │   └── csv.ts
│   ├── validators/          # Zod schemas
│   │   └── crm.schema.ts
│   ├── app.ts               # Express app
│   └── server.ts            # Server entry point
├── tests/                   # Test files
├── uploads/                 # CSV uploads (gitignored)
└── logs/                    # Application logs
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🔌 API Endpoints

### CSV Upload
- `POST /api/csv/upload` - Upload CSV file
- `GET /api/csv/preview/:fileId` - Preview CSV data

### Import
- `POST /api/import/process` - Start import process
- `GET /api/import/status/:importId` - Get import status
- `GET /api/import/history` - Get import history
- `GET /api/import/history/:id` - Get specific import details

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/imports` - Get all imports
- `GET /api/admin/leads` - Get all leads
- `GET /api/admin/leads/search` - Search leads

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🏗️ Architecture

The backend follows a clean architecture pattern:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Contain business logic
3. **Models**: Define database schemas
4. **Middleware**: Process requests before controllers
5. **Utils**: Reusable utility functions
6. **Validators**: Input validation schemas

## 🔒 Security

- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Zod
- Secure file uploads
- Environment variable validation
