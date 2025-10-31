from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..models import get_db, User
from ..schemas import GoogleAuthRequest, Token
from ..services.auth_service import google_auth_service
from ..utils.auth import create_user_token, get_current_active_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/google")
async def google_login(request: Request):
    """Get Google OAuth authorization URL"""
    try:
        authorization_url = google_auth_service.get_authorization_url(request)
        return {"authorization_url": authorization_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate authorization URL: {str(e)}"
        )


@router.post("/google/callback")
async def google_callback(
    request: Request,
    auth_data: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback"""
    try:
        # Get user information from Google
        user_info = await google_auth_service.get_user_info(request, auth_data.code)
        
        # Create or update user in database
        user = google_auth_service.create_or_update_user(user_info, db)
        
        # Create access token
        access_token = create_user_token(user)
        
        return Token(
            access_token=access_token,
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user