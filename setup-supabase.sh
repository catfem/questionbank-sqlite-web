#!/bin/bash

echo "🗄️  Setting up Supabase for Question Bank"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g @supabase/supabase-js
fi

echo "📋 Steps to set up Supabase:"
echo ""
echo "1. Go to https://supabase.com and create a new account"
echo "2. Click 'New Project' and create a project"
echo "3. Wait for the project to be ready (2-3 minutes)"
echo "4. Go to Project Settings > Database"
echo "5. Copy the Project URL and Service Role Key"
echo "6. Run the following SQL in the Supabase SQL Editor:"
echo ""
echo "   $(cat supabase/schema.sql)"
echo ""
echo "7. Go to Authentication > Providers"
echo "8. Enable Google provider"
echo "9. Add your Google Client ID and Client Secret"
echo "10. Add your deployed site URL to authorized redirect URIs"
echo ""
echo "🔗 Required Environment Variables:"
echo "SUPABASE_URL=https://your-project-id.supabase.co"
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo ""
echo "📝 After setup:"
echo "1. Add these variables to your Cloudflare Worker"
echo "2. Update the frontend .env with VITE_API_URL"
echo "3. Configure Google OAuth with your Pages domain"