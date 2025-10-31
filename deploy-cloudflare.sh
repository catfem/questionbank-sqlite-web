#!/bin/bash

# 🌐 Cloudflare Deployment Script for Question Bank Quiz System
# This script deploys the entire system to Cloudflare Workers + Pages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🌐 Cloudflare Deployment - Question Bank Quiz System"
echo "=================================================="

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed. Installing..."
        npm install -g wrangler
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_status "Prerequisites satisfied"
}

# Setup Cloudflare authentication
setup_auth() {
    print_info "Setting up Cloudflare authentication..."
    
    if ! wrangler whoami &> /dev/null; then
        print_warning "Please log in to Cloudflare:"
        wrangler auth
    fi
    
    print_status "Cloudflare authentication ready"
}

# Deploy backend to Workers
deploy_backend() {
    print_info "Deploying backend to Cloudflare Workers..."
    
    cd cloudflare-backend
    
    # Install dependencies
    npm install
    
    # Create D1 database
    print_info "Creating D1 database..."
    wrangler d1 create question-bank-db || print_warning "Database might already exist"
    
    # Create KV namespace for caching (optional)
    print_info "Creating KV namespace..."
    wrangler kv:namespace create "QUESTIONS_KV" || print_warning "KV namespace might already exist"
    
    # Update wrangler.toml with actual IDs (user needs to do this manually)
    print_warning "Please update wrangler.toml with your actual D1 database ID and KV namespace ID"
    
    # Run database migration
    print_info "Running database migration..."
    wrangler d1 execute question-bank-db --file=./schema.sql || print_warning "Migration might have already run"
    
    # Deploy to Workers
    print_info "Deploying to Workers..."
    wrangler deploy
    
    cd ..
    
    print_status "Backend deployed to Cloudflare Workers"
}

# Deploy frontend to Pages
deploy_frontend() {
    print_info "Deploying frontend to Cloudflare Pages..."
    
    cd frontend
    
    # Update API URL in environment
    print_info "Building frontend for Cloudflare..."
    npm run build:prod
    
    # Deploy to Pages
    print_info "Deploying to Cloudflare Pages..."
    wrangler pages deploy dist --project-name=question-bank-frontend || {
        print_warning "If the above fails, create Pages project manually in Cloudflare dashboard"
        print_info "Then connect your GitHub repository to Pages"
    }
    
    cd ..
    
    print_status "Frontend deployed to Cloudflare Pages"
}

# Setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    print_warning "Please set these environment variables in your Cloudflare Workers dashboard:"
    echo ""
    echo "🔧 Workers Environment Variables:"
    echo "- GOOGLE_CLIENT_ID: your_google_oauth_client_id"
    echo "- JWT_SECRET: your_jwt_secret_key"
    echo "- FRONTEND_URL: https://question-bank-frontend.pages.dev"
    echo ""
    echo "🔧 Pages Environment Variables:"
    echo "- VITE_API_URL: https://question-bank-api.your-subdomain.workers.dev"
    echo ""
}

# Final instructions
final_instructions() {
    print_status "🎉 Cloudflare deployment complete!"
    echo ""
    print_info "📋 Next Steps:"
    echo ""
    echo "1. 🌐 Your app URLs:"
    echo "   - Frontend: https://question-bank-frontend.pages.dev"
    echo "   - Backend: https://question-bank-api.your-subdomain.workers.dev"
    echo "   - API Docs: https://question-bank-api.your-subdomain.workers.dev/health"
    echo ""
    echo "2. 🔧 Set up Google OAuth:"
    echo "   - Go to Google Cloud Console"
    echo "   - Add your Workers URL to authorized origins"
    echo "   - Add Workers URL + /api/auth/google to redirect URIs"
    echo "   - Update environment variables in Cloudflare dashboard"
    echo ""
    echo "3. 🧪 Test your deployment:"
    echo "   - Visit frontend URL"
    echo "   - Test Google Sign-In"
    echo "   - Upload a DOCX file"
    echo "   - Create and take a quiz"
    echo ""
    echo "4. 📊 Monitor your app:"
    echo "   - Use 'wrangler tail' to view logs"
    echo "   - Check Cloudflare Analytics"
    echo ""
    print_status "🚀 Your Question Bank Quiz System is now live on Cloudflare!"
}

# Main execution
main() {
    check_prerequisites
    setup_auth
    deploy_backend
    deploy_frontend
    setup_environment
    final_instructions
}

# Run main function
main "$@"