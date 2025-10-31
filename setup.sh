#!/bin/bash

# Question Bank and Quiz System Setup Script

echo "🚀 Setting up Question Bank and Quiz Generation System..."

# Check if Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js 16+ is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please edit it with your Google OAuth credentials."
fi

# Initialize database
python init_db.py

echo "✅ Backend setup complete"

# Setup Frontend
echo "📦 Setting up frontend..."
cd ../frontend

# Install Node.js dependencies
npm install

echo "✅ Frontend setup complete"

cd ..

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Google OAuth:"
echo "   - Go to Google Cloud Console"
echo "   - Create OAuth 2.0 credentials"
echo "   - Edit backend/.env with your credentials"
echo ""
echo "2. Start the development servers:"
echo "   - Backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For more information, see README.md"