from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from authlib.integrations.starlette_client import OAuth
try:
    from starlette.requests import Request
except ImportError:
    from fastapi import Request
from fastapi import HTTPException, status
from ..models import User
from ..schemas import UserCreate
from ..config import settings


class GoogleAuthService:
    """Service for Google OAuth authentication"""
    
    def __init__(self):
        self.oauth = OAuth()
        self.oauth.register(
            name='google',
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile'
            }
        )
    
    async def get_user_info(self, request: Request, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for user information
        
        Args:
            request: The HTTP request object
            code: The authorization code from Google
            
        Returns:
            Dictionary containing user information
        """
        try:
            # Exchange code for token
            token = await self.oauth.google.authorize_access_token(request)
            
            # Get user info
            user_info = token.get('userinfo')
            if not user_info:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user information from Google"
                )
            
            return user_info
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to authenticate with Google: {str(e)}"
            )
    
    def create_or_update_user(self, user_info: Dict[str, Any], db: Session) -> User:
        """
        Create or update a user based on Google user information
        
        Args:
            user_info: User information from Google
            db: Database session
            
        Returns:
            User object
        """
        # Extract user data
        google_id = user_info.get('sub')
        email = user_info.get('email')
        name = user_info.get('name')
        avatar_url = user_info.get('picture')
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required from Google"
            )
        
        # Check if user exists by Google ID or email
        user = db.query(User).filter(
            (User.google_id == google_id) | (User.email == email)
        ).first()
        
        if user:
            # Update existing user
            user.name = name or user.name
            user.avatar_url = avatar_url or user.avatar_url
            user.google_id = google_id or user.google_id
            user.is_active = True
            db.commit()
            db.refresh(user)
        else:
            # Create new user
            user_data = {
                'email': email,
                'name': name or email.split('@')[0],
                'avatar_url': avatar_url,
                'google_id': google_id,
                'is_active': True
            }
            
            db_user = User(**user_data)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            user = db_user
        
        return user
    
    def get_authorization_url(self, request: Request) -> str:
        """
        Get Google OAuth authorization URL
        
        Args:
            request: The HTTP request object
            
        Returns:
            Authorization URL
        """
        redirect_uri = f"{settings.backend_url}/auth/google/callback"
        return self.oauth.google.authorize_redirect(request, redirect_uri)


# Create a singleton instance
google_auth_service = GoogleAuthService()