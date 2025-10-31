#!/bin/bash

# Question Bank Quiz System - Deployment Script
# This script automates deployment to Render.com

set -e

echo "🚀 Starting deployment of Question Bank Quiz System..."

# Check if required tools are installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "✅ Environment check passed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
npm run build:prod
cd ..

echo "✅ Dependencies installed and frontend built"

# Create production environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating production environment file..."
    cp .env.production .env
    echo "⚠️  Please update the .env file with your Google OAuth credentials"
fi

# Git operations
echo "🔄 Preparing Git repository..."
git add .
git status

echo "📋 Next steps for deployment:"
echo ""
echo "1. 🌐 Go to https://render.com and create an account"
echo "2. 📊 Create a new PostgreSQL database:"
echo "   - Name: question-bank-db"
echo "   - Plan: Free"
echo "   - Note the connection string"
echo ""
echo "3. 🔧 Set up Google OAuth:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create a new project or select existing"
echo "   - Enable Google+ API and Google OAuth2 API"
echo "   - Create OAuth 2.0 credentials for Web application"
echo "   - Add authorized redirect URIs:"
echo "     - https://your-app-name.onrender.com/api/auth/google"
echo "   - Copy Client ID and Client Secret"
echo ""
echo "4. 🚀 Deploy the backend:"
echo "   - Connect your GitHub repository to Render"
echo "   - Create a new Web Service"
echo "   - Use Dockerfile.prod as the Dockerfile path"
echo "   - Set environment variables from .env file"
echo "   - Health check path: /health"
echo ""
echo "5. 🎨 Deploy the frontend:"
echo "   - Create a Static Site service"
echo "   - Root directory: frontend"
echo "   - Build command: npm install && npm run build:prod"
echo "   - Publish directory: dist"
echo "   - Add redirect rule for API calls"
echo ""
echo "6. ✅ Update environment variables:"
echo "   - FRONTEND_URL with your frontend URL"
echo "   - DATABASE_URL with your PostgreSQL connection string"
echo "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo ""
echo "🎉 Deployment guide complete!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"