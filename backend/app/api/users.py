from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models import get_db, User
from ..schemas import User as UserSchema, MessageResponse
from ..utils.auth import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserSchema)
async def get_current_user(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_current_user(
    user_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    # Update only allowed fields
    allowed_fields = ['name', 'avatar_url']
    
    for field in allowed_fields:
        if field in user_data and user_data[field] is not None:
            setattr(current_user, field, user_data[field])
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/me/stats")
async def get_user_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    from ..services.question_service import QuizService
    
    quiz_service = QuizService(db)
    quiz_stats = quiz_service.get_user_stats(current_user.id)
    
    return {
        "user_info": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "created_at": current_user.created_at
        },
        "quiz_stats": quiz_stats
    }