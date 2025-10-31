# 🚀 Next Steps for Deployment

## 1. Commit and Push to GitHub
```bash
git commit -m "Ready for deployment - Question Bank Quiz System"
git push origin autodeploy-question-bank-quiz-system
```

## 2. Deploy to Render.com

### A. Create Render Account
- Go to https://render.com
- Create free account
- Connect your GitHub repository

### B. Deploy PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `question-bank-db`
3. Database: `question_bank`
4. Plan: Free
5. Click "Create Database"
6. Save the **Internal Database URL**

### C. Deploy Backend API
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - Name: `question-bank-api`
   - Environment: Docker
   - Root Directory: `backend`
   - Dockerfile Path: `./Dockerfile.prod`
   - Plan: Free
4. Environment Variables:
   ```
   DATABASE_URL=<your-postgres-connection-string>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   JWT_SECRET_KEY=<generate-long-random-string>
   FRONTEND_URL=https://question-bank-app.onrender.com
   PORT=8000
   ```
5. Health Check Path: `/health`
6. Click "Create Web Service"

### D. Deploy Frontend
1. Click "New +" → "Static Site"
2. Configure:
   - Name: `question-bank-app`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build:prod`
   - Publish Directory: `dist`
   - Plan: Free
3. Environment Variables:
   ```
   VITE_API_URL=https://question-bank-api.onrender.com
   ```
4. Add Custom Redirect (Advanced):
   ```
   /api/* https://question-bank-api.onrender.com/api/* 200
   /* /index.html 200
   ```
5. Click "Create Static Site"

## 3. Set up Google OAuth
1. Go to https://console.cloud.google.com/
2. Create project or select existing
3. Enable APIs: Google+ API, Google OAuth2 API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: Question Bank Quiz
   - Authorized JavaScript origins: `https://question-bank-app.onrender.com`
   - Authorized redirect URIs: `https://question-bank-api.onrender.com/api/auth/google`
5. Copy Client ID and Client Secret to Render environment variables

## 4. Test Your Deployment
- Frontend: https://question-bank-app.onrender.com
- Backend: https://question-bank-api.onrender.com/health
- API Docs: https://question-bank-api.onrender.com/docs

## 🎉 Your app will be live at the frontend URL!

