# Shared Types and Utilities

This package contains shared TypeScript types and utilities used across the frontend and backend applications.

## 📁 Structure

```
shared/
├── types/
│   ├── crm.types.ts      # CRM-related types
│   ├── csv.types.ts      # CSV-related types
│   ├── api.types.ts      # API response types
│   └── index.ts          # Export all types
├── package.json
└── tsconfig.json
```

## 🔧 Usage

### In Backend

```typescript
import { CRMLead, ImportResult } from '../shared/types';
```

### In Frontend

```typescript
import { CRMLead, ImportResult } from '../shared/types';
```

## 📝 Type Definitions

### CRM Types
- `CRMLead`: Standardized CRM lead schema
- `ImportResult`: Import process result
- `SkippedRecord`: Skipped record details
- `ImportSummary`: Import statistics

### CSV Types
- `CSVUploadResponse`: CSV upload response
- `CSVRow`: Generic CSV row
- `ParsedCSV`: Parsed CSV structure

### API Types
- `ApiResponse`: Standard API response wrapper
- `PaginationParams`: Pagination parameters
- `PaginatedResponse`: Paginated API response
