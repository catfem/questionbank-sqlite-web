#!/bin/bash

echo "🚀 Deploying Question Bank to Cloudflare Pages + Workers"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Deploy backend worker
echo "📦 Deploying backend worker..."
cd cloudflare-worker
npm install
wrangler deploy

# Get the worker URL
WORKER_URL=$(wrangler whoami 2>/dev/null | grep -o 'https://[^"]*' || echo "https://questionbank-api.your-subdomain.workers.dev")
echo "Backend deployed to: $WORKER_URL"

# Build and deploy frontend
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

echo "🌐 Frontend built successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Upload the 'dist' folder to Cloudflare Pages"
echo "2. Set environment variables in Cloudflare Pages dashboard:"
echo "   - VITE_API_URL=$WORKER_URL"
echo "   - VITE_GOOGLE_CLIENT_ID=your-google-client-id"
echo "3. Set environment variables in Cloudflare Worker:"
echo "   - SUPABASE_URL=your-supabase-url"
echo "   - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo "   - GOOGLE_CLIENT_ID=your-google-client-id"
echo "   - GOOGLE_CLIENT_SECRET=your-google-client-secret"
echo "   - JWT_SECRET=your-jwt-secret"
echo ""
echo "🔗 Don't forget to:"
echo "- Create a Supabase project and run the schema.sql"
echo "- Configure Google OAuth with your Pages domain"
echo "- Enable Supabase Google Auth provider"