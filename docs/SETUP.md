# Question Bank and Quiz Generation System

A comprehensive web application for parsing exam questions from DOCX files, managing question banks, and generating interactive quizzes with Google authentication.

## 🎯 Features

- 📄 **Document Parsing**: Upload and parse .docx files containing exam questions
- 🔐 **Google Authentication**: Secure login with Google OAuth 2.0
- 📊 **Question Management**: View, edit, filter, and organize questions
- 🎯 **Quiz Generation**: Create randomized quizzes with different question types
- 📈 **Analytics & History**: Track user performance and quiz history
- 🎨 **Modern UI**: Clean, responsive interface with TailwindCSS

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google OAuth 2.0 credentials

### Automated Setup

Run the setup script:
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python3 -m venv venv
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
python init_db.py
```

6. Start backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

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

## 🔧 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

## 📁 Project Structure

```
questionbank-sqlite-web/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── main.py         # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── docs/                    # Documentation
└── README.md
```

## 📄 Question Format Support

The system supports parsing the following question formats from DOCX files:

### Single Choice Questions
```
1. Which of the following is the capital of France? (A) London (B) Paris (C) Berlin (D) Madrid
```

### Multiple Choice Questions
```
1. Select all correct statements about photosynthesis: (A) Produces oxygen (B) Requires sunlight (C) Occurs in animals (D) Uses chlorophyll
```

### True/False Questions
```
1. The Earth is flat. (T/F)
```

## 🔍 Usage Examples

### Uploading Questions
1. Prepare a DOCX file with properly formatted questions
2. Go to Upload page
3. Select file and add optional metadata (subject, chapter, difficulty, tags)
4. Click "Upload Questions"

### Creating a Quiz
1. Go to Quizzes page
2. Click "Generate Quiz" or "Create Quiz"
3. Set quiz parameters (title, question count, filters, time limit)
4. Start taking the quiz

### Viewing Results
1. Go to Results page to see all quiz history
2. Click "View Details" to see specific quiz performance
3. Check statistics on Dashboard or Profile page

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend deployment
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Google OAuth not working**
- Ensure redirect URI matches exactly in Google Console
- Check that Client ID and Secret are correctly set in .env
- Verify Google+ API is enabled

**File upload failing**
- Check file size is under 10MB limit
- Ensure file is valid .doc or .docx format
- Verify question formatting follows supported patterns

**Database errors**
- Ensure SQLite file has proper permissions
- Run `python init_db.py` to recreate database
- Check SQLAlchemy models match database schema

### Getting Help

- Check the [API Documentation](docs/API.md)
- Review the [Wiki](https://github.com/your-repo/wiki)
- Open an [Issue](https://github.com/your-repo/issues)

## 🎉 Acknowledgments

- FastAPI for the backend framework
- React for the frontend framework
- TailwindCSS for styling
- Google OAuth for authentication
- python-docx for document parsing