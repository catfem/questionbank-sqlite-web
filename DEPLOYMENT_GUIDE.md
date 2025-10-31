# Question Bank - Cloudflare Deployment Guide

## 🚀 Project Overview

A fully functional Question Bank & Quiz System deployed on Cloudflare Pages + Workers with Supabase as the free cloud database.

## 📁 Project Structure

```
questionbank-sqlite-web/
├── cloudflare-worker/          # Cloudflare Workers backend
│   ├── src/index.js           # Main worker code
│   ├── package.json           # Dependencies
│   └── wrangler.toml         # Worker configuration
├── frontend/                  # React frontend
│   ├── dist/                 # Built files (ready for deployment)
│   ├── src/                  # Source code
│   └── package.json          # Frontend dependencies
├── supabase/
│   └── schema.sql            # Database schema
├── backend/                  # Original FastAPI backend (reference)
└── deployment files...
```

## 🔧 Deployment Steps

### 1. Setup Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new account
2. Create a new project
3. Go to the SQL Editor and run the schema from `supabase/schema.sql`
4. Go to Project Settings > API to get:
   - Project URL
   - Service Role Key
5. Go to Authentication > Providers and enable Google provider

### 2. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-domain.pages.dev`
   - Authorized redirect URIs: `https://your-domain.pages.dev`

### 3. Deploy Cloudflare Worker (Backend)

```bash
cd cloudflare-worker
npm install
# Set environment variables in Cloudflare dashboard:
# - SUPABASE_URL=your-supabase-url
# - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# - GOOGLE_CLIENT_ID=your-google-client-id
# - GOOGLE_CLIENT_SECRET=your-google-client-secret
# - JWT_SECRET=your-jwt-secret

npx wrangler deploy
```

### 4. Deploy Frontend to Cloudflare Pages

```bash
cd frontend
npm install
npm run build
# Upload the 'dist' folder to Cloudflare Pages

# Set environment variables in Cloudflare Pages:
# - VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev
# - VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🌐 Live URLs

After deployment:

- **Frontend**: `https://your-domain.pages.dev`
- **Backend API**: `https://your-worker-name.your-subdomain.workers.dev`

## ✅ Features Implemented

1. **Authentication**: Google OAuth 2.0 integration
2. **Question Management**: Upload, view, and delete questions
3. **DOCX Parsing**: Parse questions from .docx files
4. **Quiz Generation**: Create custom quizzes with filters
5. **Quiz Taking**: Interactive quiz interface
6. **History & Analytics**: View quiz attempts and scores
7. **Database**: Supabase PostgreSQL with proper schema
8. **Security**: JWT tokens, CORS, input validation

## 📊 Database Schema

- `users` - User accounts and profiles
- `questions` - Question bank with metadata
- `options` - Multiple choice options
- `tags` - Question categorization
- `quizzes` - Generated quiz configurations
- `quiz_attempts` - User quiz attempts and scores
- `import_reports` - File upload tracking

## 🔑 Environment Variables

### Cloudflare Worker
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret-key
```

### Cloudflare Pages
```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 🚀 Quick Start

1. Deploy the backend worker first
2. Deploy the frontend to Pages
3. Configure environment variables
4. Set up Google OAuth
5. Test the application

## 📝 Notes

- The application uses Supabase as the free cloud database (PostgreSQL)
- Cloudflare Workers handle all API endpoints
- Cloudflare Pages serves the React frontend
- Google OAuth provides secure authentication
- DOCX files are parsed client-side and sent to the API
- All data persists in Supabase database

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Cloudflare Workers (JavaScript)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth 2.0 + JWT
- **Hosting**: Cloudflare Pages + Workers
- **File Parsing**: Custom DOCX parser

The application is now ready for deployment with all required configurations and code in place!