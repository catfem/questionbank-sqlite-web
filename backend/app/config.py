from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Google OAuth Configuration
    google_client_id: str = ""
    google_client_secret: str = ""
    
    # Application Configuration
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database Configuration
    database_url: str = "sqlite:///./questionbank.db"
    
    # CORS Configuration
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # File Upload Configuration
    upload_dir: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # Application URLs
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()