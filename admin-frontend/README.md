# Admin Frontend - GrowEasy CSV Importer

Next.js 15 application for system administration and analytics.

## 📋 Features

- 📊 System-wide dashboard with analytics
- 👥 User management and statistics
- 🔍 Advanced lead search and filtering
- 📈 Charts and visualizations
- 📥 Bulk data export
- 🔐 Admin-only access
- 📱 Responsive design

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd groweasy-csv-importer/admin-frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ADMIN_TOKEN=your-admin-token
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## 📁 Project Structure

```
admin-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── imports/           # All system imports
│   │   ├── leads/             # Lead explorer
│   │   ├── users/             # User management
│   │   └── analytics/         # System analytics
│   ├── components/            # Reusable components
│   ├── services/              # API services
│   └── types/                 # TypeScript types
└── package.json
```

## 🎯 Pages

- **Dashboard** - System overview and statistics
- **Imports** - All imports from all users
- **Leads** - Advanced lead search and export
- **Users** - User management
- **Analytics** - Charts and insights

## 🔐 Access Control

Admin frontend requires admin authentication token.

---

**Port:** 3002  
**Access Level:** Admin Only
