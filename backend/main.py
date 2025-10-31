from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import tempfile
import json
from datetime import datetime, timedelta
import jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from config import settings
from models import get_db, create_tables, User, Question, Option, Tag, Quiz, QuizAttempt, ImportReport
from schemas import *
from docx_parser import DocxParser, ParsedQuestion

# Initialize FastAPI app
app = FastAPI(title="Question Bank & Quiz System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(email: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Auth endpoints
@app.post("/api/auth/google", response_model=Token)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify Google ID token
        idinfo = id_token.verify_oauth2_token(
            request.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo['email']
        name = idinfo['name']
        picture = idinfo.get('picture')
        google_id = idinfo['sub']
        
        # Create or get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                name=name,
                picture=picture,
                google_id=google_id,
                is_admin=False  # First user is not admin by default
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Question endpoints
@app.post("/api/questions", response_model=Question)
async def create_question(
    question: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_question = Question(
        stem=question.stem,
        question_type=question.question_type,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        difficulty=question.difficulty
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Add options
    for option_data in question.options:
        db_option = Option(
            question_id=db_question.id,
            text=option_data.text,
            label=option_data.label,
            order_index=option_data.order_index
        )
        db.add(db_option)
    
    # Add tags if provided
    if question.tags:
        for tag_name in question.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            db_question.tags.append(tag)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@app.get("/api/questions", response_model=List[Question])
async def get_questions(
    skip: int = 0,
    limit: int = 100,
    question_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    
    if question_type:
        query = query.filter(Question.question_type == question_type)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if tag:
        query = query.join(Question.tags).filter(Tag.name == tag)
    
    questions = query.offset(skip).limit(limit).all()
    return questions

@app.get("/api/questions/{question_id}", response_model=Question)
async def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.put("/api/questions/{question_id}", response_model=Question)
async def update_question(
    question_id: int,
    question_update: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Update question fields
    question.stem = question_update.stem
    question.question_type = question_update.question_type
    question.correct_answer = question_update.correct_answer
    question.explanation = question_update.explanation
    question.difficulty = question_update.difficulty
    question.updated_at = datetime.utcnow()
    
    # Update options (delete old ones, create new ones)
    db.query(Option).filter(Option.question_id == question_id).delete()
    for option_data in question_update.options:
        db_option = Option(
            question_id=question_id,
            text=option_data.text,
            label=option_data.label,
            order_index=option_data.order_index
        )
        db.add(db_option)
    
    db.commit()
    db.refresh(question)
    return question

@app.delete("/api/questions/{question_id}")
async def delete_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(question)
    db.commit()
    return {"message": "Question deleted successfully"}

# File upload and parsing
@app.post("/api/upload-docx", response_model=ImportReport)
async def upload_docx(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only .docx files are supported")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Parse the document
        parser = DocxParser()
        parsed_questions, errors = parser.parse_document(tmp_file_path)
        
        # Create import report
        import_report = ImportReport(
            filename=file.filename,
            total_lines=len(parser.current_question.raw_lines) if parser.current_question else 0,
            successful_imports=len(parsed_questions),
            failed_imports=len(errors),
            errors=[{
                'line_number': error['line_number'],
                'content': error['content'],
                'error': error['error']
            } for error in errors],
            created_by=current_user.id
        )
        
        # Save successful questions to database
        for parsed_q in parsed_questions:
            db_question = Question(
                stem=parsed_q.stem,
                question_type=parsed_q.question_type,
                correct_answer=parsed_q.correct_answer,
                explanation=parsed_q.explanation,
                difficulty=parsed_q.difficulty
            )
            db.add(db_question)
            db.flush()  # Get the ID without committing
            
            # Add options
            for i, option in enumerate(parsed_q.options):
                db_option = Option(
                    question_id=db_question.id,
                    text=option['text'],
                    label=option['label'],
                    order_index=i
                )
                db.add(db_option)
        
        db.add(import_report)
        db.commit()
        db.refresh(import_report)
        
        return import_report
    
    finally:
        # Clean up temporary file
        os.unlink(tmp_file_path)

# Quiz endpoints
@app.post("/api/quizzes/generate", response_model=Quiz)
async def generate_quiz(
    request: QuizGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    
    # Apply filters
    if request.question_type:
        query = query.filter(Question.question_type == request.question_type)
    if request.difficulty:
        query = query.filter(Question.difficulty == request.difficulty)
    if request.tag_ids:
        query = query.join(Question.tags).filter(Tag.id.in_(request.tag_ids))
    
    # Get random questions
    questions = query.limit(request.count * 2).all()  # Get more to allow for randomness
    if len(questions) < request.count:
        raise HTTPException(status_code=400, detail="Not enough questions matching criteria")
    
    import random
    selected_questions = random.sample(questions, min(request.count, len(questions)))
    question_ids = [q.id for q in selected_questions]
    
    quiz = Quiz(
        title=f"Quiz - {request.topic or 'General'}",
        description=f"Generated quiz with {len(selected_questions)} questions",
        question_ids=question_ids,
        created_by=current_user.id
    )
    
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz

@app.post("/api/quizzes/{quiz_id}/attempt", response_model=QuizAttempt)
async def submit_quiz_attempt(
    quiz_id: int,
    attempt: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get questions for this quiz
    questions = db.query(Question).filter(Question.id.in_(quiz.question_ids)).all()
    
    # Calculate score
    correct_count = 0
    for question in questions:
        correct_answers = question.correct_answer
        selected_answers = attempt.selected_answers.get(question.id, [])
        
        if set(correct_answers) == set(selected_answers):
            correct_count += 1
    
    score = (correct_count / len(questions)) * 100 if questions else 0
    
    quiz_attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        selected_answers=attempt.selected_answers,
        score=score,
        total_questions=len(questions),
        correct_answers=correct_count,
        completed_at=datetime.utcnow()
    )
    
    db.add(quiz_attempt)
    db.commit()
    db.refresh(quiz_attempt)
    
    # Load user and quiz data for response
    db.refresh(quiz_attempt)
    return quiz_attempt

@app.get("/api/quizzes/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@app.get("/api/quizzes", response_model=List[Quiz])
async def get_quizzes(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).offset(skip).limit(limit).all()
    return quizzes

# History endpoints
@app.get("/api/history", response_model=List[QuizAttempt])
async def get_user_history(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.completed_at.desc()).offset(skip).limit(limit).all()
    
    return attempts

# Tags endpoints
@app.get("/api/tags", response_model=List[Tag])
async def get_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tags = db.query(Tag).offset(skip).limit(limit).all()
    return tags

@app.post("/api/tags", response_model=Tag)
async def create_tag(
    tag: TagBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_tag = Tag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

# Import reports endpoint
@app.get("/api/import-reports", response_model=List[ImportReport])
async def get_import_reports(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    reports = db.query(ImportReport).filter(
        ImportReport.created_by == current_user.id
    ).order_by(ImportReport.created_at.desc()).offset(skip).limit(limit).all()
    
    return reports

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)