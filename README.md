# GrowEasy CSV Importer

AI-assisted CSV import platform for converting varied lead files into a consistent CRM format.

The project is a TypeScript monorepo with:

- `backend` - Express API, MongoDB models, CSV processing, AI extraction, authentication, and admin endpoints.
- `user-frontend` - Next.js app for users to upload CSV files, preview data, process imports, and review history.
- `admin-frontend` - Next.js app for admins to inspect imports, users, leads, and analytics.
- `shared` - Shared TypeScript types used across the apps.

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- MongoDB connection string
- AWS Bedrock API key, or another configured AI provider if you extend the backend

## Setup

Install dependencies from the repository root:

```bash
npm install
```

Create backend environment config:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your MongoDB URI, JWT secret, CORS origins, and AI provider settings.

Optional frontend env files:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Place that value in `user-frontend/.env` and `admin-frontend/.env` when you need to override the default.

## Development

Run the full stack:

```bash
npm run dev
```

Local services:

- User app: `http://localhost:3001`
- Admin app: `http://localhost:3002`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

Run one service:

```bash
npm run dev:backend
npm run dev:user
npm run dev:admin
```

## Build

Build every workspace:

```bash
npm run build
```

Build a single workspace:

```bash
npm run build --workspace=backend
npm run build --workspace=user-frontend
npm run build --workspace=admin-frontend
npm run build --workspace=shared
```

## Project Structure

```text
.
├── backend/          Express API and import pipeline
├── user-frontend/    User-facing Next.js app
├── admin-frontend/   Admin Next.js app
├── shared/           Shared TypeScript types
├── package.json      Workspace scripts
└── render.yaml       Deployment configuration
```

## Main Workflow

1. User uploads a CSV file.
2. Backend validates and parses the CSV.
3. AI extraction maps source columns into the CRM lead schema.
4. Backend normalizes phone, email, dates, status, and project data.
5. Leads and import history are saved to MongoDB.
6. User and admin apps show progress, results, history, and analytics.

## Useful Scripts

```bash
npm run dev
npm run build
npm test --workspace=backend
npm run type-check --workspace=user-frontend
npm run type-check --workspace=admin-frontend
```

## Notes

- `.env`, uploaded CSV files, build output, and dependency folders are ignored by git.
- The Next apps use system fonts so local and CI builds do not depend on Google Fonts network access.
- Keep secrets out of the repository. Use `.env.example` as the template only.
