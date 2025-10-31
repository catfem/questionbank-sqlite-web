from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import get_db, User
from ..schemas import (
    Question, QuestionCreate, QuestionUpdate, QuestionFilter,
    MessageResponse, PaginatedResponse
)
from ..services.question_service import QuestionService
from ..services.file_service import FileService
from ..utils.document_parser import parse_docx_file, validate_question_data
from ..utils.auth import get_current_active_user
from ..config import settings
import asyncio

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/", response_model=List[Question])
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    question_types: Optional[List[str]] = Query(None),
    subjects: Optional[List[str]] = Query(None),
    chapters: Optional[List[str]] = Query(None),
    difficulty: Optional[List[str]] = Query(None),
    tags: Optional[List[str]] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get questions with optional filtering"""
    question_service = QuestionService(db)
    
    # Build filters
    filters = None
    if any([question_types, subjects, chapters, difficulty, tags, search]):
        filters = QuestionFilter(
            question_types=question_types,
            subjects=subjects,
            chapters=chapters,
            difficulty=difficulty,
            tags=tags,
            search=search
        )
    
    questions = question_service.get_questions(skip=skip, limit=limit, filters=filters)
    return questions


@router.get("/{question_id}", response_model=Question)
async def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific question by ID"""
    question_service = QuestionService(db)
    question = question_service.get_question_by_id(question_id)
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question


@router.post("/", response_model=Question)
async def create_question(
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new question"""
    question_service = QuestionService(db)
    
    # Validate question data
    if not validate_question_data(question_data.dict()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid question data"
        )
    
    question = question_service.create_question(question_data.dict())
    return question


@router.put("/{question_id}", response_model=Question)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a question"""
    question_service = QuestionService(db)
    
    # Get update data (exclude None values)
    update_data = {k: v for k, v in question_data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )
    
    question = question_service.update_question(question_id, update_data)
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question


@router.delete("/{question_id}", response_model=MessageResponse)
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a question"""
    question_service = QuestionService(db)
    success = question_service.delete_question(question_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return MessageResponse(message="Question deleted successfully")


@router.post("/upload", response_model=MessageResponse)
async def upload_questions_file(
    file: UploadFile = File(...),
    subject: Optional[str] = None,
    chapter: Optional[str] = None,
    difficulty: Optional[str] = None,
    tags: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and parse a DOCX file containing questions"""
    try:
        # Save uploaded file
        file_service = FileService()
        filename, file_path = await file_service.save_upload_file(file)
        
        # Parse questions from file
        metadata = {
            'subject': subject,
            'chapter': chapter,
            'difficulty': difficulty,
            'tags': tags.split(',') if tags else []
        }
        
        questions_data = parse_docx_file(file_path, metadata)
        
        if not questions_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No questions found in the uploaded file"
            )
        
        # Save questions to database
        question_service = QuestionService(db)
        created_count = 0
        
        for question_data in questions_data:
            try:
                question_service.create_question(question_data)
                created_count += 1
            except Exception as e:
                # Log error but continue processing other questions
                print(f"Error creating question: {str(e)}")
        
        # Clean up uploaded file
        file_service.delete_file(file_path)
        
        return MessageResponse(
            message=f"Successfully uploaded and parsed {created_count} questions"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process uploaded file: {str(e)}"
        )


@router.get("/stats/summary")
async def get_question_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get question statistics"""
    question_service = QuestionService(db)
    stats = question_service.get_question_stats()
    return stats