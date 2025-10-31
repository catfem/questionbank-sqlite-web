# Deployment Guide - Question Bank Quiz System

This guide will walk you through deploying the Question Bank Quiz System to Render.com using their free tier.

## 🎯 Deployment Target: Render.com

Render.com provides:
- ✅ Free tier hosting
- ✅ PostgreSQL database
- ✅ Docker support
- ✅ Automatic SSL certificates
- ✅ CI/CD from GitHub

## 📋 Prerequisites

1. **Render.com Account**: Create a free account at https://render.com
2. **GitHub Account**: Your code must be on GitHub
3. **Google Cloud Console**: For OAuth setup

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Clone and prepare
git clone <your-repository-url>
cd question-bank-quiz-system

# Run the deployment script
./deploy.sh
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Google+ API
   - Google OAuth2 API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: Question Bank Quiz
   - Authorized JavaScript origins: `https://your-app-name.onrender.com`
   - Authorized redirect URIs: `https://your-api-name.onrender.com/api/auth/google`
5. Copy the **Client ID** and **Client Secret**

### 3. Deploy PostgreSQL Database

1. In Render Dashboard, click **New +**
2. Select **PostgreSQL**
3. Configure:
   - Name: `question-bank-db`
   - Database: `question_bank`
   - User: `question_bank_user`
   - Plan: Free
4. Click **Create Database**
5. Save the **Connection String** (Internal URL)

### 4. Deploy Backend API

1. In Render Dashboard, click **New +**
2. Select **Web Service**
3. Connect your GitHub repository
4. Configure:
   - Name: `question-bank-api`
   - Environment: Docker
   - Root Directory: `backend`
   - Dockerfile Path: `./Dockerfile.prod`
   - Plan: Free
5. Add Environment Variables:
   ```
   DATABASE_URL=<your-postgres-connection-string>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   JWT_SECRET_KEY=<generate-long-random-string>
   FRONTEND_URL=https://your-app-name.onrender.com
   PORT=8000
   ```
6. Add Health Check:
   - Path: `/health`
7. Click **Create Web Service**

### 5. Deploy Frontend

1. In Render Dashboard, click **New +**
2. Select **Static Site**
3. Configure:
   - Name: `question-bank-app`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build:prod`
   - Publish Directory: `dist`
   - Plan: Free
4. Add Environment Variables:
   ```
   VITE_API_URL=https://question-bank-api.onrender.com
   ```
5. Add Redirects (Advanced Settings):
   ```
   /api/* https://question-bank-api.onrender.com/api/* 200
   /* /index.html 200
   ```
6. Click **Create Static Site**

### 6. Final Configuration

1. **Update CORS Settings**:
   - Go to your backend service
   - Update `FRONTEND_URL` with your actual frontend URL
   - Redeploy

2. **Test the Application**:
   - Visit your frontend URL
   - Try Google Sign-In
   - Upload a test DOCX file
   - Create and take a quiz

## 🔧 Environment Variables Reference

### Backend (question-bank-api)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET_KEY=your-super-secret-jwt-key
FRONTEND_URL=https://your-app-name.onrender.com
PORT=8000
```

### Frontend (question-bank-app)
```
VITE_API_URL=https://question-bank-api.onrender.com
```

## 🧪 Testing Your Deployment

1. **Health Check**: Visit `https://question-bank-api.onrender.com/health`
2. **Frontend**: Visit `https://question-bank-app.onrender.com`
3. **Google OAuth**: Test sign-in flow
4. **File Upload**: Upload a sample DOCX file
5. **Quiz Creation**: Generate and take a quiz

## 📊 Sample DOCX Files

Test files are available in the `examples/` directory:
- `sample_questions_1.docx` - Basic format
- `sample_questions_2.docx` - Alternative format

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` matches your frontend URL exactly
   - Check for trailing slashes

2. **Google OAuth Fails**:
   - Verify authorized origins and redirect URIs in Google Cloud Console
   - Check that Client ID and Secret are correctly set

3. **Database Connection**:
   - Ensure PostgreSQL is running
   - Verify connection string format
   - Check user permissions

4. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are installed

### Debug Commands

```bash
# Check backend health
curl https://question-bank-api.onrender.com/health

# Check API endpoints
curl https://question-bank-api.onrender.com/api/questions

# Check frontend build
curl -I https://question-bank-app.onrender.com
```

## 📈 Monitoring

Render provides built-in monitoring:
- Service health
- Response times
- Error rates
- Resource usage

## 🔄 Updates and Maintenance

- **Backend changes**: Push to GitHub, Render auto-redeploys
- **Frontend changes**: Push to GitHub, Render auto-rebuilds
- **Database migrations**: Manual execution via Render console

## 💡 Pro Tips

1. **Use Environment-Specific URLs**:
   - Development: `http://localhost:5173`
   - Production: `https://your-app.onrender.com`

2. **Security**:
   - Never commit secrets to Git
   - Use Render's environment variables
   - Rotate JWT secrets regularly

3. **Performance**:
   - Monitor database query performance
   - Use CDN for static assets
   - Optimize images and files

## 🆘 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints individually
4. Review Google OAuth configuration

---

**🎉 Your Question Bank Quiz System is now live and publicly accessible!**