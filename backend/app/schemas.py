from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class QuestionType(str, Enum):
    SINGLE = "single"
    MULTIPLE = "multiple"
    TRUE_FALSE = "true_false"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    google_id: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class User(UserBase):
    id: int
    google_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Question Schemas
class OptionBase(BaseModel):
    key: str
    text: str


class OptionCreate(OptionBase):
    pass


class Option(OptionBase):
    pass


class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    options: Optional[List[Option]] = None
    correct_answers: List[str]
    explanation: Optional[str] = None
    subject: Optional[str] = None
    chapter: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None


class QuestionCreate(QuestionBase):
    uploaded_file_id: Optional[int] = None


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[Option]] = None
    correct_answers: Optional[List[str]] = None
    explanation: Optional[str] = None
    subject: Optional[str] = None
    chapter: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None


class Question(QuestionBase):
    id: int
    uploaded_file_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# File Upload Schemas
class UploadedFileBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    mime_type: str


class UploadedFileCreate(UploadedFileBase):
    file_path: str
    uploaded_by: int


class UploadedFile(UploadedFileBase):
    id: int
    file_path: str
    processing_status: ProcessingStatus
    error_message: Optional[str] = None
    questions_count: int
    uploaded_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    question_count: int = Field(..., gt=0)
    question_types: Optional[List[QuestionType]] = None
    subjects: Optional[List[str]] = None
    difficulty: Optional[List[DifficultyLevel]] = None
    time_limit: Optional[int] = Field(None, gt=0)  # Minutes


class QuizCreate(QuizBase):
    pass


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    question_count: Optional[int] = Field(None, gt=0)
    question_types: Optional[List[QuestionType]] = None
    subjects: Optional[List[str]] = None
    difficulty: Optional[List[DifficultyLevel]] = None
    time_limit: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class Quiz(QuizBase):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Quiz Question Schemas
class QuizQuestionBase(BaseModel):
    quiz_id: int
    question_id: int
    order: int


class QuizQuestion(QuizQuestionBase):
    id: int
    question: Question
    
    class Config:
        from_attributes = True


# Quiz Result Schemas
class QuizAnswer(BaseModel):
    question_id: int
    selected_answers: List[str]


class QuizResultBase(BaseModel):
    quiz_id: int
    score: int
    total_questions: int
    percentage: int
    time_taken: Optional[int] = None
    answers: List[QuizAnswer]
    started_at: datetime


class QuizResultCreate(QuizResultBase):
    user_id: int


class QuizResult(QuizResultBase):
    id: int
    user_id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True


# Auth Schemas
class GoogleAuthRequest(BaseModel):
    code: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


class TokenData(BaseModel):
    email: Optional[str] = None


# API Response Schemas
class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


# Question Filter Schema
class QuestionFilter(BaseModel):
    question_types: Optional[List[QuestionType]] = None
    subjects: Optional[List[str]] = None
    chapters: Optional[List[str]] = None
    difficulty: Optional[List[DifficultyLevel]] = None
    tags: Optional[List[str]] = None
    search: Optional[str] = None


# Quiz Generation Schema
class QuizGenerationRequest(BaseModel):
    title: str
    description: Optional[str] = None
    question_count: int = Field(..., gt=0, le=100)
    filters: Optional[QuestionFilter] = None
    time_limit: Optional[int] = Field(None, gt=0, le=180)  # Max 3 hours


# Quiz Taking Schema
class QuizSubmission(BaseModel):
    quiz_id: int
    answers: List[QuizAnswer]
    time_taken: Optional[int] = None