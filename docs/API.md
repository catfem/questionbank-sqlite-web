# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All API endpoints (except `/auth/google`) require Bearer token authentication.

## Endpoints

### Authentication

#### GET /auth/google
Get Google OAuth authorization URL.

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/..."
}
```

#### POST /auth/google/callback
Handle Google OAuth callback.

**Request:**
```json
{
  "code": "authorization_code_from_google"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Questions

#### GET /questions
Get questions with optional filtering.

**Query Parameters:**
- `skip` (int): Number of questions to skip (default: 0)
- `limit` (int): Maximum number of questions to return (default: 100)
- `search` (string): Search term for question text
- `question_types` (string[]): Filter by question types ["single", "multiple", "true_false"]
- `subjects` (string[]): Filter by subjects
- `difficulty` (string[]): Filter by difficulty ["easy", "medium", "hard"]
- `tags` (string[]): Filter by tags

**Response:**
```json
[
  {
    "id": 1,
    "question_text": "What is the capital of France?",
    "question_type": "single",
    "options": [
      {"key": "A", "text": "London"},
      {"key": "B", "text": "Paris"},
      {"key": "C", "text": "Berlin"},
      {"key": "D", "text": "Madrid"}
    ],
    "correct_answers": ["B"],
    "explanation": "Paris is the capital of France.",
    "subject": "Geography",
    "difficulty": "easy",
    "created_at": "2023-01-01T00:00:00Z"
  }
]
```

#### GET /questions/{id}
Get a specific question by ID.

#### POST /questions
Create a new question.

**Request:**
```json
{
  "question_text": "What is the capital of France?",
  "question_type": "single",
  "options": [
    {"key": "A", "text": "London"},
    {"key": "B", "text": "Paris"},
    {"key": "C", "text": "Berlin"},
    {"key": "D", "text": "Madrid"}
  ],
  "correct_answers": ["B"],
  "explanation": "Paris is the capital of France.",
  "subject": "Geography",
  "difficulty": "easy"
}
```

#### PUT /questions/{id}
Update a question.

#### DELETE /questions/{id}
Delete a question.

#### POST /questions/upload
Upload and parse a DOCX file containing questions.

**Request:** `multipart/form-data`
- `file`: DOCX file
- `subject` (optional): Subject for all questions
- `chapter` (optional): Chapter for all questions
- `difficulty` (optional): Difficulty for all questions
- `tags` (optional): Comma-separated tags for all questions

**Response:**
```json
{
  "message": "Successfully uploaded and parsed 25 questions"
}
```

#### GET /questions/stats/summary
Get question statistics.

**Response:**
```json
{
  "total_questions": 100,
  "by_type": {
    "single": 60,
    "multiple": 30,
    "true_false": 10
  },
  "by_difficulty": {
    "easy": 40,
    "medium": 35,
    "hard": 25
  }
}
```

### Quizzes

#### GET /quizzes
Get quizzes for the current user.

#### GET /quizzes/{id}
Get a specific quiz by ID.

#### POST /quizzes
Create a new quiz.

**Request:**
```json
{
  "title": "Geography Quiz",
  "description": "Test your knowledge of world capitals",
  "question_count": 10,
  "question_types": ["single"],
  "subjects": ["Geography"],
  "difficulty": ["easy", "medium"],
  "time_limit": 30
}
```

#### POST /quizzes/generate
Generate a quiz with random questions based on filters.

#### GET /quizzes/{id}/questions
Get questions for a specific quiz.

#### POST /quizzes/{id}/submit
Submit quiz answers.

**Request:**
```json
{
  "quiz_id": 1,
  "answers": [
    {
      "question_id": 1,
      "selected_answers": ["B"]
    }
  ],
  "time_taken": 1800
}
```

**Response:**
```json
{
  "id": 1,
  "quiz_id": 1,
  "user_id": 1,
  "score": 8,
  "total_questions": 10,
  "percentage": 80,
  "time_taken": 1800,
  "answers": [...],
  "completed_at": "2023-01-01T00:30:00Z"
}
```

#### GET /quizzes/results/my-results
Get all quiz results for the current user.

#### GET /quizzes/stats/my-stats
Get user statistics.

### Users

#### GET /users/me
Get current user information.

#### PUT /users/me
Update current user information.

#### GET /users/me/stats
Get user statistics.

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 413: Payload Too Large
- 500: Internal Server Error