#!/bin/bash

# 🚀 Question Bank Quiz System - One-Click Deployment Script
# This script prepares and deploys the entire system to Render.com

set -e

echo "🎯 Question Bank Quiz System - Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    print_status "All prerequisites satisfied"
}

# Setup environment
setup_environment() {
    print_info "Setting up environment..."
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    
    # Install frontend dependencies and build
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    print_info "Building frontend for production..."
    npm run build:prod
    cd ..
    
    print_status "Environment setup complete"
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    # Backend tests
    print_info "Running backend tests..."
    cd backend
    source venv/bin/activate
    python -m pytest test_docx_parser.py -v
    python -m pytest test_integration.py -v
    cd ..
    
    print_status "All tests passed"
}

# Prepare for deployment
prepare_deployment() {
    print_info "Preparing for deployment..."
    
    # Create production environment file
    if [ ! -f ".env" ]; then
        cp .env.production .env
        print_warning "Please update .env file with your credentials"
    fi
    
    # Add all changes to git
    git add .
    
    print_status "Deployment preparation complete"
}

# Generate deployment instructions
generate_instructions() {
    print_info "Generating deployment instructions..."
    
    cat > NEXT_STEPS.md << 'EOF'
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

EOF
    
    print_status "Deployment instructions generated in NEXT_STEPS.md"
}

# Main execution
main() {
    print_info "Starting deployment process..."
    
    check_prerequisites
    setup_environment
    run_tests
    prepare_deployment
    generate_instructions
    
    print_status "🎉 Deployment preparation complete!"
    print_info "See NEXT_STEPS.md for deployment instructions"
    print_info "Your Question Bank Quiz System is ready to go live!"
}

# Run main function
main "$@"