# Question Bank & Quiz System

A full-stack web application for managing question banks and generating quizzes with Google OAuth authentication.

## Features

- **Docx Parsing**: Upload and parse `.docx` files to extract questions
- **Question Management**: View, edit, and delete questions in the question bank
- **Quiz Generation**: Create custom quizzes with filtering options
- **Quiz Taking**: Interactive quiz interface with progress tracking
- **History & Analytics**: View past quiz attempts and performance statistics
- **Google OAuth**: Secure authentication using Google Sign-In
- **Import Reports**: Detailed reports on document parsing success and errors

## Tech Stack

### Backend
- **FastAPI** (Python web framework)
- **SQLAlchemy** (ORM)
- **SQLite** (default database, PostgreSQL optional)
- **python-docx** (DOCX parsing)
- **Google Auth** (OAuth verification)
- **JWT** (Session management)

### Frontend
- **React** with TypeScript
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **React Router** (navigation)
- **React Query** (API state management)
- **Heroicons** (icons)

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google OAuth credentials

### 1. Clone and Setup

```bash
git clone <repository-url>
cd question-bank-quiz-system
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp ../.env.example .env
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (frontend)
     - `http://localhost:8000/api/auth/google` (backend)
5. Copy Client ID and Client Secret to your `.env` file

### 5. Run the Application

Start the backend:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./question_bank.db

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
FRONTEND_URL=http://localhost:5173
```

## Using PostgreSQL (Optional)

To use PostgreSQL instead of SQLite:

1. Install PostgreSQL adapter:
```bash
pip install psycopg2-binary
```

2. Update your `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost/dbname
```

## DOCX File Format

The system supports the following question format in DOCX files:

### Single Choice Question
```
1. What is the capital of France?
A. London
B. Berlin
C. Paris
D. Madrid
Answer: C
Explanation: Paris is the capital of France.
```

### Multiple Choice Question
```
2. Which of the following are programming languages?
A. Python
B. HTML
C. Java
D. CSS
Answer: A, C
```

### True/False Question
```
3. The Earth is flat.
Answer: False
```

### Supported Formats
- Question numbers: `1.`, `2.`, `Question 1:`, `Q1.`
- Options: `A.`, `B)`, `A)`, `B.`
- Answers: `Answer: C`, `Answer: A, C`, `Answer: True`
- Optional: `Explanation: text`, `Difficulty: easy/medium/hard`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `GET /api/questions/{id}` - Get question
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question

### File Upload
- `POST /api/upload-docx` - Upload and parse DOCX file

### Quizzes
- `POST /api/quizzes/generate` - Generate quiz
- `GET /api/quizzes/{id}` - Get quiz
- `POST /api/quizzes/{id}/attempt` - Submit quiz attempt

### History
- `GET /api/history` - Get user's quiz history

## Testing

### Backend Tests
```bash
cd backend
pytest test_docx_parser.py -v
pytest test_integration.py -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

### Manual Docker Build

```bash
# Build backend
cd backend
docker build -t quiz-backend .

# Build frontend
cd ../frontend
docker build -t quiz-frontend .
```

## Creating an Admin User

After setting up Google OAuth, the first user to sign in can be made an admin by updating the database:

```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

## Demo Data

Sample DOCX files are provided in the `examples/` directory:
- `sample_questions_1.docx` - Basic format examples
- `sample_questions_2.docx` - Alternative format examples

## Project Structure

```
question-bank-quiz-system/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── config.py            # Configuration
│   ├── docx_parser.py       # DOCX parsing logic
│   ├── requirements.txt     # Python dependencies
│   ├── test_docx_parser.py  # Parser unit tests
│   └── test_integration.py  # Integration tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
├── examples/
│   ├── sample_questions_1.docx
│   └── sample_questions_2.docx
├── docker-compose.yml      # Docker compose configuration
├── Dockerfile              # Docker configuration
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce