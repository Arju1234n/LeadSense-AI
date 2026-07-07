# User Frontend - GrowEasy CSV Importer

Next.js 15 application for uploading and processing CSV files with AI-powered field mapping.

## 📋 Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 📤 Drag & drop CSV file upload
- 👁️ Live CSV preview before processing
- 🤖 AI-powered intelligent field mapping
- 📊 Real-time import progress tracking
- 📈 Import history and analytics
- 🔍 Advanced data tables with filtering
- 🎯 Clean and intuitive user experience

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd groweasy-csv-importer/user-frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📁 Project Structure

```
user-frontend/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (redirects to dashboard)
│   │   ├── globals.css        # Global styles
│   │   ├── dashboard/         # Dashboard page
│   │   ├── upload/            # CSV upload page
│   │   ├── history/           # Import history page
│   │   └── import/            # Import process pages
│   │       ├── [id]/preview/  # CSV preview
│   │       ├── [id]/processing/ # Processing status
│   │       └── [id]/results/  # Import results
│   ├── components/            # Reusable components
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   ├── UploadDropzone.tsx
│   │   ├── DataTable.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── LoadingOverlay.tsx
│   │   └── Modal.tsx
│   ├── services/              # API services
│   │   ├── api.ts            # Axios instance
│   │   └── import.service.ts # Import API calls
│   ├── types/                 # TypeScript types
│   │   └── index.ts          # Shared types
│   ├── lib/                   # Utility functions
│   │   └── utils.ts          # Helper functions
│   └── hooks/                 # Custom React hooks
│       ├── useUpload.ts
│       ├── useImport.ts
│       └── useHistory.ts
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎨 Pages

### Dashboard (`/dashboard`)
- Overview statistics
- Recent imports
- Quick actions

### Upload CSV (`/upload`)
- Drag & drop interface
- File validation
- Instant upload feedback

### CSV Preview (`/import/[id]/preview`)
- Table preview of CSV data
- Column statistics
- Validation warnings
- Import confirmation

### Processing (`/import/[id]/processing`)
- Real-time progress bar
- Batch processing status
- Processing analytics

### Results (`/import/[id]/results`)
- Import summary cards
- Successfully imported leads table
- Skipped records table
- Export functionality

### Import History (`/history`)
- All past imports
- Sorting and filtering
- Detailed import information

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Tables:** TanStack Table
- **File Upload:** React Dropzone
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Validation:** Zod

## 🎯 Key Components

### UploadDropzone
Drag & drop component for CSV file upload with validation.

### DataTable
Reusable table component with sorting, filtering, and pagination.

### ProgressBar
Animated progress indicator for upload and processing.

### StatCard
Dashboard statistic card with icon and trend indicator.

## 🔌 API Integration

The frontend communicates with the backend API running on `http://localhost:5000/api`.

### Main Endpoints Used:
- `POST /csv/upload` - Upload CSV file
- `POST /import/:id` - Start import process
- `GET /import/:id/status` - Get import status
- `GET /import/:id/results` - Get import results
- `GET /import/history` - Get import history

## 🎨 Styling

The application uses Tailwind CSS with custom color palette:

- **Primary:** Blue tones for main actions
- **Success:** Green for successful operations
- **Warning:** Amber for warnings
- **Danger:** Red for errors

Custom components follow a consistent design system with cards, buttons, and inputs.

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
npm run build
npm start
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📝 Development Tips

### Adding New Pages
1. Create page in `src/app/` directory
2. Use layout component for consistent UI
3. Import required services and types

### Creating Components
1. Add component to `src/components/`
2. Use TypeScript for prop types
3. Follow naming convention: `PascalCase.tsx`

### API Calls
1. Use `importService` from `services/import.service.ts`
2. Handle errors with try-catch
3. Show loading states

## 🐛 Common Issues

### Port Already in Use
```bash
# Change port in package.json
"dev": "next dev -p 3002"
```

### API Connection Failed
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify API_URL in .env

### TypeScript Errors
```bash
npm run type-check
```

## 📄 License

Part of GrowEasy CSV Importer project.

## 👥 Support

For issues and questions, please refer to the main project README.
