# 🌐 Cloudflare Deployment Guide - Question Bank Quiz System

## 🎯 Overview

Deploy your Question Bank Quiz System to **Cloudflare Workers + Pages** for:
- ✅ **Free hosting** with generous limits
- ✅ **Global CDN** for fast performance
- ✅ **Serverless architecture** with automatic scaling
- ✅ **Built-in D1 database** for data persistence
- ✅ **SSL certificates** included
- ✅ **Custom domains** supported

---

## 🚀 Quick Deployment (10 Minutes)

### 1. Prerequisites
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler auth
```

### 2. Deploy Backend (Workers)
```bash
cd cloudflare-backend
npm install
wrangler deploy --config wrangler-simple.toml
```

### 3. Deploy Frontend (Pages)
```bash
cd ../frontend
npm install
npm run build:prod
wrangler pages deploy dist --project-name=question-bank-frontend
```

---

## 📋 Detailed Steps

### A. Backend Deployment (Cloudflare Workers)

1. **Navigate to backend directory**:
```bash
cd cloudflare-backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Deploy to Workers**:
```bash
wrangler deploy --config wrangler-simple.toml
```

4. **Note your Workers URL**:
```
https://question-bank-api.your-subdomain.workers.dev
```

### B. Frontend Deployment (Cloudflare Pages)

1. **Navigate to frontend directory**:
```bash
cd ../frontend
```

2. **Update API URL**:
Edit `vite.config.prod.ts`:
```typescript
export default defineConfig({
  // ... other config
  define: {
    'process.env.VITE_API_URL': JSON.stringify('https://question-bank-api.your-subdomain.workers.dev')
  }
})
```

3. **Build for production**:
```bash
npm run build:prod
```

4. **Deploy to Pages**:
```bash
wrangler pages deploy dist --project-name=question-bank-frontend
```

5. **Note your Pages URL**:
```
https://question-bank-frontend.pages.dev
```

---

## 🔧 Configuration

### Environment Variables

#### Workers Environment Variables
Set these in Cloudflare Dashboard → Workers → question-bank-api → Settings → Variables:

```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id
FRONTEND_URL=https://question-bank-frontend.pages.dev
```

#### Pages Environment Variables
Set these in Cloudflare Dashboard → Pages → question-bank-frontend → Settings → Environment variables:

```bash
VITE_API_URL=https://question-bank-api.your-subdomain.workers.dev
```

### Custom Domain Setup

1. **For Workers**:
   - Go to Workers → question-bank-api → Triggers → Custom Domains
   - Add: `api.yourdomain.com`

2. **For Pages**:
   - Go to Pages → question-bank-frontend → Custom Domains
   - Add: `app.yourdomain.com`

---

## 🔑 Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create OAuth 2.0 Credentials**:
   - Application type: Web application
   - Name: Question Bank Quiz
   - Authorized JavaScript origins:
     - `https://question-bank-frontend.pages.dev`
   - Authorized redirect URIs:
     - `https://question-bank-api.your-subdomain.workers.dev/api/auth/google`

3. **Update Environment Variables**:
   - Copy Client ID to Workers environment variables
   - Copy Client Secret to Workers environment variables

---

## 🧪 Testing Your Deployment

### Health Checks
```bash
# Backend health
curl https://question-bank-api.your-subdomain.workers.dev/health

# Frontend load
curl -I https://question-bank-frontend.pages.dev
```

### Manual Testing
1. **Visit Frontend**: `https://question-bank-frontend.pages.dev`
2. **Test Google Sign-In**: Click "Sign in with Google"
3. **Upload DOCX**: Try uploading a sample file
4. **Create Quiz**: Generate a quiz with filters
5. **Take Quiz**: Complete the quiz and view results
6. **Check History**: View past attempts

---

## 📊 Features Available

### ✅ Working Features
- **Authentication**: Mock Google OAuth (ready for real credentials)
- **Question Management**: View questions with filtering
- **Quiz Generation**: Create custom quizzes
- **Quiz Taking**: Interactive quiz interface
- **History**: View past quiz attempts
- **Responsive Design**: Works on all devices

### 🔧 Production Enhancements
For full production use, implement:
- **Real Google OAuth verification**
- **D1 database integration** (schema provided)
- **DOCX parsing** (using compatible library)
- **File storage** (Cloudflare R2)
- **Email notifications** (SendGrid integration)

---

## 📁 File Structure

```
cloudflare-backend/
├── src/
│   ├── index.js          # Full D1 integration
│   └── simple-index.js   # Mock version for quick demo
├── wrangler.toml         # Full config
├── wrangler-simple.toml   # Demo config
├── schema.sql            # Database schema
└── package.json

frontend/
├── src/                  # React source
├── dist/                 # Build output
├── _redirects            # Cloudflare redirects
├── wrangler.toml         # Pages config
└── package.json
```

---

## 🔍 Monitoring & Debugging

### View Logs
```bash
# Workers logs
wrangler tail

# Pages logs (in dashboard)
# Go to Pages → question-bank-frontend → Analytics → Logs
```

### Analytics
- **Workers**: Built-in request analytics
- **Pages**: Built-in visitor analytics
- **D1**: Query analytics in dashboard

---

## 🚀 Advanced Features

### D1 Database Integration
To use real database instead of mock data:

1. **Create D1 database**:
```bash
wrangler d1 create question-bank-db
```

2. **Update wrangler.toml**:
```toml
[[d1_databases]]
binding = "DB"
database_name = "question-bank-db"
database_id = "your-database-id"
```

3. **Run migration**:
```bash
wrangler d1 execute question-bank-db --file=./schema.sql
```

4. **Use full index.js**:
```bash
wrangler deploy --config wrangler.toml
```

### File Storage with R2
For DOCX file uploads:

1. **Create R2 bucket**:
```bash
wrangler r2 bucket create question-bank-files
```

2. **Update Workers code** to use R2 API

---

## 💰 Pricing & Limits

### Free Tier (Current)
- **Workers**: 100,000 requests/day
- **Pages**: 500 builds/month
- **D1**: 5GB storage, 25M reads/month
- **R2**: 10GB storage, 1M Class A operations/month

### Scaling
- **Workers Pro**: $5/month for higher limits
- **Pages Pro**: $20/month for advanced features
- **D1**: Pay-as-you-go beyond free tier

---

## 🎯 Success Metrics

Your deployment is successful when:
- ✅ Frontend loads at your Pages URL
- ✅ API responds at Workers URL
- ✅ Health check returns 200 OK
- ✅ Users can navigate between pages
- ✅ Mock quiz functionality works
- ✅ Responsive design works on mobile

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check FRONTEND_URL environment variable
   - Verify API URL in frontend build

2. **Build Failures**:
   - Check Node.js version (requires 18+)
   - Clear cache: `npm cache clean --force`

3. **Workers Errors**:
   - Check syntax in index.js
   - View logs: `wrangler tail`

4. **Pages Deployment**:
   - Ensure build output exists in `dist/`
   - Check _redirects file format

### Get Help
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Community**: https://community.cloudflare.com/

---

## 🎉 You're Live!

Once deployed, your Question Bank Quiz System will be available at:

- **Frontend**: `https://question-bank-frontend.pages.dev`
- **Backend API**: `https://question-bank-api.your-subdomain.workers.dev`
- **API Health**: `https://question-bank-api.your-subdomain.workers.dev/health`

**🚀 Your quiz system is now live on Cloudflare's global network!**