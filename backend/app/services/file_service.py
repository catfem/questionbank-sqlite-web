import os
import uuid
import aiofiles
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from ..config import settings


class FileService:
    """Service for handling file operations"""
    
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> tuple[str, str]:
        """
        Save an uploaded file to disk
        
        Args:
            upload_file: The uploaded file
            
        Returns:
            Tuple of (filename, file_path)
            
        Raises:
            HTTPException: If file is too large or invalid type
        """
        # Check file size
        if upload_file.size and upload_file.size > settings.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {settings.max_file_size} bytes"
            )
        
        # Check file type
        allowed_types = [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
            "application/msword"  # .doc
        ]
        
        if upload_file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only .doc and .docx files are allowed"
            )
        
        # Create upload directory if it doesn't exist
        os.makedirs(settings.upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await upload_file.read()
            await f.write(content)
        
        return unique_filename, file_path
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Delete a file from disk
        
        Args:
            file_path: Path to the file to delete
            
        Returns:
            True if file was deleted, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False
    
    @staticmethod
    def get_file_size(file_path: str) -> Optional[int]:
        """
        Get file size in bytes
        
        Args:
            file_path: Path to the file
            
        Returns:
            File size in bytes or None if file doesn't exist
        """
        try:
            if os.path.exists(file_path):
                return os.path.getsize(file_path)
            return None
        except Exception:
            return None