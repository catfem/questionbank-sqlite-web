from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None
    google_id: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Question schemas
class OptionBase(BaseModel):
    text: str
    label: str
    order_index: int

class OptionCreate(OptionBase):
    pass

class Option(OptionBase):
    id: int
    question_id: int
    
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    stem: str
    question_type: str  # 'single', 'multiple', 'true_false'
    correct_answer: List[int]
    explanation: Optional[str] = None
    difficulty: str = "medium"

class QuestionCreate(QuestionBase):
    options: List[OptionCreate]
    tags: Optional[List[str]] = None

class Question(QuestionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    options: List[Option]
    
    class Config:
        from_attributes = True

# Tag schemas
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    question_ids: List[int]
    time_limit_minutes: Optional[int] = None

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuizAttemptBase(BaseModel):
    selected_answers: Dict[int, List[int]]
    score: float
    total_questions: int
    correct_answers: int

class QuizAttemptCreate(QuizAttemptBase):
    quiz_id: int

class QuizAttempt(QuizAttemptBase):
    id: int
    user_id: int
    quiz_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    user: User
    quiz: Quiz
    
    class Config:
        from_attributes = True

# Import schemas
class ImportError(BaseModel):
    line_number: int
    content: str
    error: str

class ImportReportBase(BaseModel):
    filename: str
    total_lines: int
    successful_imports: int
    failed_imports: int
    errors: List[ImportError]

class ImportReport(ImportReportBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: str

# Quiz generation schemas
class QuizGenerationRequest(BaseModel):
    topic: Optional[str] = None
    question_type: Optional[str] = None
    difficulty: Optional[str] = None
    count: int = 10
    tag_ids: Optional[List[int]] = None