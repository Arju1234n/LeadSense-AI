# User Frontend

Next.js user app for uploading CSV lead files, previewing parsed data, running AI imports, and reviewing import history.

## Setup

From the repository root:

```bash
npm install
```

Optional local environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Scripts

```bash
npm run dev --workspace=user-frontend
npm run build --workspace=user-frontend
npm start --workspace=user-frontend
npm run lint --workspace=user-frontend
npm run type-check --workspace=user-frontend
```

The development server runs on `http://localhost:3001`.

Production URL: `https://leadsense-ai-frontend.onrender.com`

Production API URL:

```env
NEXT_PUBLIC_API_URL=https://leadsense-ai.onrender.com/api
```

## Pages

- `/login` - user sign in
- `/register` - user registration
- `/dashboard` - import overview and quick actions
- `/upload` - CSV upload flow
- `/import/[id]/preview` - parsed CSV preview
- `/import/[id]/processing` - import progress
- `/import/[id]/results` - import summary and records
- `/history` - previous imports

## Source Layout

```text
src/
├── app/          Next.js App Router pages and layouts
├── components/   shared UI components
├── hooks/        upload, import, history, and theme hooks
├── lib/          utility helpers
├── services/     API clients
└── types/        frontend TypeScript types
```

## Notes

- The app talks to the backend through `NEXT_PUBLIC_API_URL`.
- Authentication tokens are stored in browser local storage.
- Styling uses Tailwind CSS and shared design classes in `src/app/globals.css`.
