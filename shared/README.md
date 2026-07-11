# Shared

Shared TypeScript package for API, CRM, CSV, and cross-app type definitions.

## Scripts

```bash
npm run build --workspace=shared
```

## Source Layout

```text
types/
├── api.types.ts
├── crm.types.ts
├── csv.types.ts
└── index.ts
```

## Usage

Import types from the package instead of duplicating contracts in each app:

```ts
import type { ApiResponse, CRMLead, ImportResult } from 'shared';
```

Keep this package focused on stable contracts. Runtime business logic belongs in the backend or frontend workspaces.
