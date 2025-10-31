from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    picture = Column(String)
    google_id = Column(String, unique=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    questions = relationship("Question", secondary="question_tags", back_populates="tags")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    stem = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # 'single', 'multiple', 'true_false'
    correct_answer = Column(JSON, nullable=False)  # Array of correct option indices
    explanation = Column(Text)
    difficulty = Column(String, default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="question_tags", back_populates="questions")

class Option(Base):
    __tablename__ = "options"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    text = Column(Text, nullable=False)
    label = Column(String, nullable=False)  # A, B, C, D
    order_index = Column(Integer, nullable=False)
    
    question = relationship("Question", back_populates="options")

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    question_ids = Column(JSON, nullable=False)  # Array of question IDs
    time_limit_minutes = Column(Integer)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    attempts = relationship("QuizAttempt", back_populates="quiz")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    selected_answers = Column(JSON, nullable=False)  # Map of question_id to selected option indices
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")

class ImportReport(Base):
    __tablename__ = "import_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    total_lines = Column(Integer, nullable=False)
    successful_imports = Column(Integer, nullable=False)
    failed_imports = Column(Integer, nullable=False)
    errors = Column(JSON)  # Array of error messages
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

# Association table for many-to-many relationship between questions and tags
from sqlalchemy import Table
question_tags = Table(
    'question_tags',
    Base.metadata,
    Column('question_id', Integer, ForeignKey('questions.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

# Database setup
engine = create_engine(
    "sqlite:///./question_bank.db", 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)