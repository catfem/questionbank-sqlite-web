from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import get_db, User
from ..schemas import (
    Quiz, QuizCreate, QuizUpdate, QuizGenerationRequest,
    QuizResult, QuizSubmission, QuizQuestion, MessageResponse
)
from ..services.question_service import QuizService
from ..utils.auth import get_current_active_user
from datetime import datetime

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/", response_model=List[Quiz])
async def get_quizzes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get quizzes for the current user"""
    quiz_service = QuizService(db)
    quizzes = quiz_service.get_quizzes_for_user(current_user.id, skip=skip, limit=limit)
    return quizzes


@router.get("/{quiz_id}", response_model=Quiz)
async def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific quiz by ID"""
    quiz_service = QuizService(db)
    quiz = quiz_service.get_quiz_by_id(quiz_id)
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    return quiz


@router.post("/", response_model=Quiz)
async def create_quiz(
    quiz_data: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new quiz"""
    quiz_service = QuizService(db)
    
    try:
        # Create quiz
        quiz = quiz_service.create_quiz(quiz_data.dict(), current_user.id)
        
        # Generate quiz questions
        quiz_service.generate_quiz_questions(
            quiz.id,
            quiz.question_count,
            quiz_data.dict().get('filters')
        )
        
        return quiz
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create quiz: {str(e)}"
        )


@router.post("/generate", response_model=Quiz)
async def generate_quiz(
    quiz_request: QuizGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate a quiz with random questions"""
    quiz_service = QuizService(db)
    
    try:
        # Create quiz data
        quiz_data = {
            "title": quiz_request.title,
            "description": quiz_request.description,
            "question_count": quiz_request.question_count,
            "question_types": [qt.value for qt in quiz_request.filters.question_types] if quiz_request.filters and quiz_request.filters.question_types else None,
            "subjects": quiz_request.filters.subjects if quiz_request.filters else None,
            "difficulty": [d.value for d in quiz_request.filters.difficulty] if quiz_request.filters and quiz_request.filters.difficulty else None,
            "time_limit": quiz_request.time_limit
        }
        
        # Create quiz
        quiz = quiz_service.create_quiz(quiz_data, current_user.id)
        
        # Generate quiz questions
        quiz_service.generate_quiz_questions(
            quiz.id,
            quiz_request.question_count,
            quiz_request.filters
        )
        
        return quiz
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@router.get("/{quiz_id}/questions", response_model=List[QuizQuestion])
async def get_quiz_questions(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get questions for a specific quiz"""
    quiz_service = QuizService(db)
    quiz = quiz_service.get_quiz_by_id(quiz_id)
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Get quiz questions with question details
    from ..models import QuizQuestion
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.quiz_id == quiz_id
    ).order_by(QuizQuestion.order).all()
    
    return questions


@router.post("/{quiz_id}/submit", response_model=QuizResult)
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit quiz answers and get results"""
    quiz_service = QuizService(db)
    
    try:
        result = quiz_service.submit_quiz_result(
            quiz_id=quiz_id,
            user_id=current_user.id,
            answers=submission.answers,
            time_taken=submission.time_taken,
            started_at=datetime.utcnow()  # In a real app, this would come from the client
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit quiz: {str(e)}"
        )


@router.get("/{quiz_id}/results", response_model=List[QuizResult])
async def get_quiz_results(
    quiz_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get results for a specific quiz"""
    quiz_service = QuizService(db)
    quiz = quiz_service.get_quiz_by_id(quiz_id)
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Get results for current user only
    from ..models import QuizResult
    results = db.query(QuizResult).filter(
        QuizResult.quiz_id == quiz_id,
        QuizResult.user_id == current_user.id
    ).order_by(QuizResult.completed_at.desc()).offset(skip).limit(limit).all()
    
    return results


@router.get("/results/my-results", response_model=List[QuizResult])
async def get_my_quiz_results(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all quiz results for the current user"""
    quiz_service = QuizService(db)
    results = quiz_service.get_user_quiz_results(current_user.id, skip=skip, limit=limit)
    return results


@router.get("/stats/my-stats")
async def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get quiz statistics for the current user"""
    quiz_service = QuizService(db)
    stats = quiz_service.get_user_stats(current_user.id)
    return stats


@router.put("/{quiz_id}", response_model=Quiz)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a quiz"""
    quiz_service = QuizService(db)
    quiz = quiz_service.get_quiz_by_id(quiz_id)
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    if quiz.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this quiz"
        )
    
    # Get update data (exclude None values)
    update_data = {k: v for k, v in quiz_data.dict().items() if v is not None}
    
    for key, value in update_data.items():
        setattr(quiz, key, value)
    
    db.commit()
    db.refresh(quiz)
    
    return quiz


@router.delete("/{quiz_id}", response_model=MessageResponse)
async def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a quiz"""
    quiz_service = QuizService(db)
    quiz = quiz_service.get_quiz_by_id(quiz_id)
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    if quiz.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this quiz"
        )
    
    # Soft delete by setting is_active to False
    quiz.is_active = False
    db.commit()
    
    return MessageResponse(message="Quiz deleted successfully")