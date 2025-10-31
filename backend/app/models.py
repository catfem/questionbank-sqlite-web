from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
from .config import settings

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    quiz_results = relationship("QuizResult", back_populates="user")
    uploaded_files = relationship("UploadedFile", back_populates="user")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # "single", "multiple", "true_false"
    options = Column(JSON, nullable=True)  # Store options as JSON
    correct_answers = Column(JSON, nullable=False)  # Store correct answers as JSON
    explanation = Column(Text, nullable=True)
    subject = Column(String, nullable=True)
    chapter = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)  # "easy", "medium", "hard"
    tags = Column(JSON, nullable=True)  # Store tags as JSON
    uploaded_file_id = Column(Integer, ForeignKey("uploaded_files.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploaded_file = relationship("UploadedFile", back_populates="questions")
    quiz_questions = relationship("QuizQuestion", back_populates="question")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    processing_status = Column(String, default="pending")  # "pending", "processing", "completed", "failed"
    error_message = Column(Text, nullable=True)
    questions_count = Column(Integer, default=0)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="uploaded_files")
    questions = relationship("Question", back_populates="uploaded_file")


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    question_count = Column(Integer, nullable=False)
    question_types = Column(JSON, nullable=True)  # Filter by question types
    subjects = Column(JSON, nullable=True)  # Filter by subjects
    difficulty = Column(JSON, nullable=True)  # Filter by difficulty
    time_limit = Column(Integer, nullable=True)  # Minutes
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")
    quiz_questions = relationship("QuizQuestion", back_populates="quiz")
    results = relationship("QuizResult", back_populates="quiz")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quiz = relationship("Quiz", back_populates="quiz_questions")
    question = relationship("Question", back_populates="quiz_questions")


class QuizResult(Base):
    __tablename__ = "quiz_results"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)
    time_taken = Column(Integer, nullable=True)  # Seconds
    answers = Column(JSON, nullable=False)  # Store user answers as JSON
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quiz = relationship("Quiz", back_populates="results")
    user = relationship("User", back_populates="quiz_results")


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)