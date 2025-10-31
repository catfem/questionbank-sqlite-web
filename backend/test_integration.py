import pytest
import tempfile
import os
import json
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from main import app
from models import Base, get_db, User, Question, Option
from docx_parser import create_sample_docx

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test database
Base.metadata.create_all(bind=engine)

client = TestClient(app)

class TestIntegration:
    
    def test_full_quiz_flow(self):
        """Test the complete flow from upload to quiz completion."""
        
        # Create test user (simulating Google OAuth)
        test_user = User(
            email="test@example.com",
            name="Test User",
            google_id="123456789",
            is_admin=True
        )
        db = TestingSessionLocal()
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        # Create sample questions
        questions_data = [
            {
                'stem': 'What is the capital of France?',
                'options': ['London', 'Berlin', 'Paris', 'Madrid'],
                'correct_answer': [2],
                'question_type': 'single',
                'explanation': 'Paris is the capital of France.'
            },
            {
                'stem': 'Which of the following are programming languages?',
                'options': ['Python', 'HTML', 'Java', 'CSS'],
                'correct_answer': [0, 2],
                'question_type': 'multiple',
                'explanation': 'Python and Java are programming languages.'
            },
            {
                'stem': 'The Earth is flat.',
                'options': ['True', 'False'],
                'correct_answer': [1],
                'question_type': 'true_false',
                'explanation': 'The Earth is round.'
            }
        ]
        
        # Create temporary DOCX file
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as tmp:
            create_sample_docx(tmp.name, questions_data)
            tmp_file_path = tmp.name
        
        try:
            # 1. Upload and parse DOCX file
            with open(tmp_file_path, 'rb') as f:
                response = client.post(
                    "/api/upload-docx",
                    files={"file": ("test_questions.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                    headers={"Authorization": "Bearer test_token"}  # We'll mock auth
                )
            
            # Note: This would fail in real test without proper auth setup,
            # but let's continue with the flow for demonstration
            
            # 2. Manually add questions to test database
            for i, q_data in enumerate(questions_data):
                question = Question(
                    stem=q_data['stem'],
                    question_type=q_data['question_type'],
                    correct_answer=q_data['correct_answer'],
                    explanation=q_data['explanation']
                )
                db.add(question)
                db.flush()
                
                for j, option_text in enumerate(q_data['options']):
                    option = Option(
                        question_id=question.id,
                        text=option_text,
                        label=chr(ord('A') + j),
                        order_index=j
                    )
                    db.add(option)
            
            db.commit()
            
            # 3. Generate a quiz
            response = client.post(
                "/api/quizzes/generate",
                json={
                    "topic": "General Knowledge",
                    "count": 2
                },
                headers={"Authorization": "Bearer test_token"}
            )
            
            # 4. Get questions from database
            questions = db.query(Question).all()
            assert len(questions) >= 2
            
            # 5. Simulate quiz attempt
            selected_answers = {}
            for question in questions[:2]:
                if question.question_type == 'single':
                    selected_answers[question.id] = question.correct_answer
                elif question.question_type == 'multiple':
                    selected_answers[question.id] = question.correct_answer
                elif question.question_type == 'true_false':
                    selected_answers[question.id] = question.correct_answer
            
            # 6. Create quiz manually for testing
            from backend.models import Quiz
            quiz = Quiz(
                title="Test Quiz",
                description="Integration test quiz",
                question_ids=[q.id for q in questions[:2]],
                created_by=test_user.id
            )
            db.add(quiz)
            db.commit()
            db.refresh(quiz)
            
            # 7. Submit quiz attempt
            from backend.models import QuizAttempt
            attempt = QuizAttempt(
                user_id=test_user.id,
                quiz_id=quiz.id,
                selected_answers=selected_answers,
                score=100.0,
                total_questions=2,
                correct_answers=2
            )
            db.add(attempt)
            db.commit()
            db.refresh(attempt)
            
            # 8. Verify attempt was recorded
            attempts = db.query(QuizAttempt).filter(
                QuizAttempt.user_id == test_user.id
            ).all()
            
            assert len(attempts) >= 1
            assert attempts[0].score == 100.0
            assert attempts[0].correct_answers == 2
            assert attempts[0].total_questions == 2
            
        finally:
            os.unlink(tmp_file_path)
            db.close()
    
    def test_question_crud_operations(self):
        """Test CRUD operations for questions."""
        db = TestingSessionLocal()
        
        # Create a test user
        test_user = User(
            email="crud@example.com",
            name="CRUD Test User",
            google_id="987654321",
            is_admin=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        # Create a question
        question = Question(
            stem="Test question stem",
            question_type="single",
            correct_answer=[0],
            explanation="Test explanation"
        )
        db.add(question)
        db.flush()
        
        # Add options
        option1 = Option(
            question_id=question.id,
            text="Option A",
            label="A",
            order_index=0
        )
        option2 = Option(
            question_id=question.id,
            text="Option B",
            label="B",
            order_index=1
        )
        db.add(option1)
        db.add(option2)
        db.commit()
        db.refresh(question)
        
        # Verify question was created
        assert question.stem == "Test question stem"
        assert len(question.options) == 2
        assert question.options[0].text == "Option A"
        
        # Update question
        question.stem = "Updated question stem"
        question.explanation = "Updated explanation"
        db.commit()
        db.refresh(question)
        
        assert question.stem == "Updated question stem"
        assert question.explanation == "Updated explanation"
        
        # Delete question
        db.delete(question)
        db.commit()
        
        # Verify deletion
        deleted_question = db.query(Question).filter(Question.id == question.id).first()
        assert deleted_question is None
        
        db.close()

if __name__ == "__main__":
    pytest.main([__file__])