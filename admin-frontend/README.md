# Admin Frontend

Next.js admin app for monitoring imports, users, leads, and platform analytics.

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
npm run dev --workspace=admin-frontend
npm run build --workspace=admin-frontend
npm start --workspace=admin-frontend
npm run lint --workspace=admin-frontend
npm run type-check --workspace=admin-frontend
```

The development server runs on `http://localhost:3002`.

Production URL: `https://leadsense-ai-admin.onrender.com`

Production API URL:

```env
NEXT_PUBLIC_API_URL=https://leadsense-ai.onrender.com/api
```

## Pages

- `/login` - admin sign in
- `/dashboard` - system overview
- `/imports` - all import jobs
- `/leads` - searchable lead list
- `/users` - user overview
- `/analytics` - charts and aggregate metrics

## Source Layout

```text
src/
├── app/          Next.js App Router pages and dashboard layout
├── components/   tables, charts, navigation, modal, cards
├── lib/          utility helpers
├── services/     API clients
└── types/        admin and shared TypeScript types
```

## Notes

- The app talks to the backend through `NEXT_PUBLIC_API_URL`.
- Admin routes depend on backend authentication and authorization.
- Styling uses Tailwind CSS and shared design classes in `src/app/globals.css`.
