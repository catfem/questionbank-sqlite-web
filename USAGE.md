# Usage Guide & API Examples

This document provides detailed usage instructions and API examples for the Question Bank & Quiz System.

## Quick Demo Setup

### 1. Create Admin User

After setting up the application, create an admin user:

```bash
# Option 1: Using the web interface
# 1. Start the application
# 2. Sign in with Google OAuth
# 3. Update the database directly to make yourself an admin

# Option 2: Using SQLite CLI
cd backend
sqlite3 question_bank.db
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
.exit
```

### 2. Upload Sample Questions

```bash
# Use the sample files provided
cp examples/sample_questions_1.docx ./temp_upload.docx

# Or via the web interface:
# 1. Navigate to Upload DOCX page
# 2. Select sample_questions_1.docx from examples/
# 3. Click Upload
```

### 3. Generate and Take a Quiz

```bash
# Via web interface:
# 1. Go to Generate Quiz page
# 2. Set count to 5 questions
# 3. Click Generate Quiz
# 4. Take the quiz interactively
# 5. View results in History
```

## API Examples

### Authentication

#### Google OAuth Login
```bash
curl -X POST "http://localhost:8000/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"id_token": "your_google_id_token_here"}'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer your_access_token_here"
```

### Questions Management

#### List Questions
```bash
curl -X GET "http://localhost:8000/api/questions" \
  -H "Authorization: Bearer your_access_token_here"
```

#### List Questions with Filters
```bash
curl -X GET "http://localhost:8000/api/questions?question_type=single&difficulty=medium" \
  -H "Authorization: Bearer your_access_token_here"
```

#### Create Question
```bash
curl -X POST "http://localhost:8000/api/questions" \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "stem": "What is the capital of Japan?",
    "question_type": "single",
    "correct_answer": [1],
    "explanation": "Tokyo is the capital of Japan.",
    "difficulty": "easy",
    "options": [
      {"text": "Seoul", "label": "A", "order_index": 0},
      {"text": "Tokyo", "label": "B", "order_index": 1},
      {"text": "Beijing", "label": "C", "order_index": 2},
      {"text": "Bangkok", "label": "D", "order_index": 3}
    ],
    "tags": ["geography", "asia"]
  }'
```

#### Update Question
```bash
curl -X PUT "http://localhost:8000/api/questions/1" \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "stem": "What is the capital of Japan? (Updated)",
    "question_type": "single",
    "correct_answer": [1],
    "explanation": "Tokyo is the capital and largest city of Japan.",
    "difficulty": "medium",
    "options": [
      {"text": "Seoul", "label": "A", "order_index": 0},
      {"text": "Tokyo", "label": "B", "order_index": 1},
      {"text": "Beijing", "label": "C", "order_index": 2},
      {"text": "Bangkok", "label": "D", "order_index": 3}
    ]
  }'
```

#### Delete Question
```bash
curl -X DELETE "http://localhost:8000/api/questions/1" \
  -H "Authorization: Bearer your_access_token_here"
```

### File Upload

#### Upload DOCX File
```bash
curl -X POST "http://localhost:8000/api/upload-docx" \
  -H "Authorization: Bearer your_access_token_here" \
  -F "file=@/path/to/your/questions.docx"
```

Response:
```json
{
  "id": 1,
  "filename": "questions.docx",
  "total_lines": 50,
  "successful_imports": 8,
  "failed_imports": 2,
  "errors": [
    {
      "line_number": 15,
      "content": "Invalid question format",
      "error": "Missing correct answer"
    }
  ],
  "created_at": "2023-12-01T10:30:00.000Z"
}
```

### Quiz Management

#### Generate Quiz
```bash
curl -X POST "http://localhost:8000/api/quizzes/generate" \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "General Knowledge",
    "question_type": "single",
    "difficulty": "medium",
    "count": 10,
    "tag_ids": [1, 2, 3]
  }'
```

Response:
```json
{
  "id": 1,
  "title": "Quiz - General Knowledge",
  "description": "Generated quiz with 10 questions",
  "question_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "created_by": 1,
  "created_at": "2023-12-01T10:30:00.000Z"
}
```

#### Get Quiz Details
```bash
curl -X GET "http://localhost:8000/api/quizzes/1" \
  -H "Authorization: Bearer your_access_token_here"
```

#### Submit Quiz Attempt
```bash
curl -X POST "http://localhost:8000/api/quizzes/1/attempt" \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": 1,
    "selected_answers": {
      "1": [1],
      "2": [0, 2],
      "3": [1]
    }
  }'
```

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "quiz_id": 1,
  "selected_answers": {
    "1": [1],
    "2": [0, 2],
    "3": [1]
  },
  "score": 66.67,
  "total_questions": 3,
  "correct_answers": 2,
  "started_at": "2023-12-01T10:30:00.000Z",
  "completed_at": "2023-12-01T10:35:00.000Z"
}
```

### History and Analytics

#### Get User History
```bash
curl -X GET "http://localhost:8000/api/history?limit=10&skip=0" \
  -H "Authorization: Bearer your_access_token_here"
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "quiz_id": 1,
    "selected_answers": {
      "1": [1],
      "2": [0, 2]
    },
    "score": 50.0,
    "total_questions": 2,
    "correct_answers": 1,
    "started_at": "2023-12-01T10:30:00.000Z",
    "completed_at": "2023-12-01T10:35:00.000Z",
    "quiz": {
      "id": 1,
      "title": "Quiz - General Knowledge",
      "description": "Generated quiz with 10 questions"
    }
  }
]
```

### Tags Management

#### Get All Tags
```bash
curl -X GET "http://localhost:8000/api/tags" \
  -H "Authorization: Bearer your_access_token_here"
```

#### Create Tag
```bash
curl -X POST "http://localhost:8000/api/tags" \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{"name": "mathematics"}'
```

### Import Reports

#### Get Import Reports
```bash
curl -X GET "http://localhost:8000/api/import-reports" \
  -H "Authorization: Bearer your_access_token_here"
```

## DOCX Format Examples

### Example 1: Basic Single Choice
```
1. What is 2 + 2?
A. 3
B. 4
C. 5
D. 22
Answer: B
```

### Example 2: Multiple Choice
```
2. Which of the following are fruits?
A. Apple
B. Carrot
C. Banana
D. Broccoli
Answer: A, C
```

### Example 3: True/False
```
3. The sun rises in the east.
Answer: True
```

### Example 4: With Explanation and Difficulty
```
4. What is the largest planet?
A. Mars
B. Jupiter
C. Saturn
D. Earth
Answer: B
Explanation: Jupiter is the largest planet in our solar system.
Difficulty: easy
```

### Example 5: Multi-line Question
```
5. Consider the following:
A company has 100 employees.
If 20% work remotely, how many work in the office?
A. 20
B. 80
C. 100
D. 0
Answer: B
```

## Testing the Parser

You can test the DOCX parser directly:

```python
from backend.docx_parser import DocxParser

# Parse a document
parser = DocxParser()
questions, errors = parser.parse_document('sample_questions.docx')

print(f"Successfully parsed {len(questions)} questions")
print(f"Encountered {len(errors)} errors")

for i, question in enumerate(questions):
    print(f"Question {i+1}: {question.stem}")
    print(f"Type: {question.question_type}")
    print(f"Options: {[opt['text'] for opt in question.options]}")
    print(f"Correct: {question.correct_answer}")
    print("---")
```

## Common Issues and Solutions

### 1. Google OAuth Setup Issues

**Problem**: Redirect URI mismatch
```
Solution: Ensure the redirect URI in Google Console matches exactly:
- http://localhost:5173/auth/callback (for frontend)
- http://localhost:8000/api/auth/google (for backend)
```

**Problem**: Invalid client ID/secret
```
Solution: Double-check the .env file and ensure you're using the correct credentials from Google Cloud Console.
```

### 2. DOCX Parsing Issues

**Problem**: Questions not being parsed
```
Solution: Ensure your DOCX follows the format:
- Questions start with numbers (1., 2., etc.)
- Options are lettered (A., B., C., etc.)
- Answers are marked with "Answer: X"
```

**Problem**: Options not being detected
```
Solution: Check option formatting:
- Use A., B., C., D. format
- Ensure each option is on a separate line
- Don't use numbering for options
```

### 3. Database Issues

**Problem**: SQLite database not found
```
Solution: The database is created automatically on first run.
Ensure the backend has write permissions to its directory.
```

**Problem**: Migration issues
```
Solution: Delete the database file and restart the application
to recreate tables with the latest schema.
```

### 4. Frontend Issues

**Problem**: API calls failing
```
Solution: Check that:
- Backend is running on port 8000
- Frontend proxy is configured correctly in vite.config.ts
- CORS is properly configured in backend
```

**Problem**: Authentication not working
```
Solution: Ensure:
- Google OAuth credentials are set in .env
- Frontend is using the correct OAuth flow
- JWT token is being stored in localStorage
```

## Performance Tips

1. **Database Optimization**: For production, consider using PostgreSQL instead of SQLite
2. **File Upload Limits**: Implement file size limits for DOCX uploads
3. **Caching**: Add Redis caching for frequently accessed questions
4. **Pagination**: Implement pagination for large question sets
5. **Indexing**: Add database indexes for better query performance

## Security Considerations

1. **Input Validation**: All inputs are validated using Pydantic schemas
2. **SQL Injection Prevention**: Using SQLAlchemy ORM prevents SQL injection
3. **JWT Security**: Use strong secrets and consider token refresh
4. **File Upload Security**: Validate file types and scan for malware
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Monitoring and Logging

1. **Application Logs**: Check backend logs for errors
2. **Database Queries**: Monitor slow database queries
3. **User Activity**: Track quiz attempts and system usage
4. **Error Tracking**: Implement error tracking for production issues