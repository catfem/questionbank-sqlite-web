import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./question_bank.db"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()