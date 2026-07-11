# Backend

Express and TypeScript API for CSV uploads, AI-assisted CRM mapping, import history, authentication, and admin reporting.

## Setup

From the repository root:

```bash
npm install
cp backend/.env.example backend/.env
```

Edit `backend/.env` before running the API. At minimum, set:

- `MONGODB_URI`
- `JWT_SECRET`
- `BEDROCK_API_KEY`
- `AWS_REGION`
- `CORS_ORIGIN`

## Scripts

```bash
npm run dev --workspace=backend
npm run build --workspace=backend
npm start --workspace=backend
npm test --workspace=backend
```

The development server runs on `http://localhost:5000` by default.

Production API URL: `https://leadsense-ai.onrender.com/api`

Production CORS origins:

```env
CORS_ORIGIN=https://leadsense-ai-frontend.onrender.com,https://leadsense-ai-admin.onrender.com
```

## API Areas

- `POST /api/auth/register` - create a user
- `POST /api/auth/login` - sign in and receive a JWT
- `POST /api/csv/upload` - upload and parse a CSV
- `GET /api/csv/preview/:id` - preview parsed CSV rows
- `POST /api/import/:id` - process an uploaded CSV
- `GET /api/import/:id/status` - check import progress
- `GET /api/import/:id/results` - read import results
- `GET /api/import/history` - list user import history
- `GET /api/admin/*` - admin dashboards, imports, users, and leads
- `GET /api/health` - health check with database status

## Source Layout

```text
src/
├── config/       environment, database, and AI config
├── constants/    CRM status and data-source constants
├── controllers/  Express request handlers
├── middleware/   auth, uploads, logging, rate limit, errors
├── models/       Mongoose models
├── routes/       API route modules
├── services/     CSV, AI, CRM, and history business logic
├── types/        Backend TypeScript types
├── utils/        phone, email, date, retry, logger helpers
├── validators/   Zod validation schemas
├── app.ts        Express app setup
└── server.ts     server bootstrap
```

## Development Notes

- Uploaded files go to `uploads/` and are ignored by git.
- Compiled output goes to `dist/` and is ignored by git.
- Use `SKIP_AUTH=true` only for local testing.
- Keep `.env` private. Update `.env.example` when new configuration keys are added.
