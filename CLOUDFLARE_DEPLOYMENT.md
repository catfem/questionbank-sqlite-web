# Cloudflare Pages Configuration

## Build Configuration
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: `18`

## Environment Variables
Set these in your Cloudflare Pages dashboard:

### Frontend Variables
- `VITE_API_URL`: `https://questionbank-api.your-subdomain.workers.dev`
- `VITE_GOOGLE_CLIENT_ID`: `your-google-client-id`

### Backend Worker Variables
- `SUPABASE_URL`: `your-supabase-project-url`
- `SUPABASE_SERVICE_ROLE_KEY`: `your-supabase-service-role-key`
- `GOOGLE_CLIENT_ID`: `your-google-client-id`
- `GOOGLE_CLIENT_SECRET`: `your-google-client-secret`
- `JWT_SECRET`: `your-jwt-secret-key`

## Deployment Steps

### 1. Deploy Backend (Cloudflare Worker)
```bash
cd cloudflare-worker
npm install
wrangler deploy
```

### 2. Deploy Frontend (Cloudflare Pages)
```bash
cd frontend
npm install
npm run build
# Upload dist/ folder to Cloudflare Pages
```

### 3. Configure Google OAuth
Update your Google OAuth console with:
- Authorized JavaScript origins: `https://your-pages-domain.pages.dev`
- Authorized redirect URIs: `https://your-pages-domain.pages.dev`

### 4. Configure Supabase
1. Create a new Supabase project
2. Run the schema.sql file in the Supabase SQL editor
3. Enable authentication with Google provider
4. Get your service role key from project settings