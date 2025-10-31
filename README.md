# Question Bank and Quiz Generation System

A comprehensive web application for parsing exam questions from DOCX files, managing question banks, and generating interactive quizzes with Google authentication.

## Features

- 📄 **Document Parsing**: Upload and parse .docx files containing exam questions
- 🔐 **Google Authentication**: Secure login with Google OAuth 2.0
- 📊 **Question Management**: View, edit, filter, and organize questions
- 🎯 **Quiz Generation**: Create randomized quizzes with different question types
- 📈 **Analytics & History**: Track user performance and quiz history
- 🎨 **Modern UI**: Clean, responsive interface with TailwindCSS

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite) + TailwindCSS
- **Database**: SQLite with SQLAlchemy
- **Authentication**: Google OAuth 2.0
- **Document Parsing**: python-docx
- **State Management**: React Context API

## Project Structure

```
questionbank-sqlite-web/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── api/             # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── config.py        # Configuration
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utilities
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React context
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── docs/                    # Documentation
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google OAuth 2.0 credentials

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Google OAuth credentials
```

5. Initialize database:
```bash
python -m app.database init
```

6. Start backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Question Format Support

The system supports parsing the following question formats from DOCX files:

- **Single Choice**: "1. Which of the following... (A)... (B)... (C)... (D)..."
- **Multiple Choice**: "1. Select all correct statements... (A)... (B)... (C)... (D)..."
- **True/False**: "1. The Earth is flat. (T/F)"

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.