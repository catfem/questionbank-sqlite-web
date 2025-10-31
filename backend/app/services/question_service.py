from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..models import Question, Quiz, QuizQuestion, User, QuizResult, UploadedFile
from ..schemas import QuestionType, DifficultyLevel, QuestionFilter, QuizAnswer
import random


class QuestionService:
    """Service for managing questions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_questions(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[QuestionFilter] = None
    ) -> List[Question]:
        """Get questions with optional filtering"""
        query = self.db.query(Question)
        
        if filters:
            # Filter by question types
            if filters.question_types:
                query = query.filter(Question.question_type.in_([qt.value for qt in filters.question_types]))
            
            # Filter by subjects
            if filters.subjects:
                query = query.filter(Question.subject.in_(filters.subjects))
            
            # Filter by chapters
            if filters.chapters:
                query = query.filter(Question.chapter.in_(filters.chapters))
            
            # Filter by difficulty
            if filters.difficulty:
                query = query.filter(Question.difficulty.in_([d.value for d in filters.difficulty]))
            
            # Filter by tags
            if filters.tags:
                for tag in filters.tags:
                    query = query.filter(Question.tags.contains([tag]))
            
            # Search in question text
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(Question.question_text.ilike(search_term))
        
        return query.offset(skip).limit(limit).all()
    
    def get_question_by_id(self, question_id: int) -> Optional[Question]:
        """Get a question by ID"""
        return self.db.query(Question).filter(Question.id == question_id).first()
    
    def create_question(self, question_data: Dict[str, Any]) -> Question:
        """Create a new question"""
        db_question = Question(**question_data)
        self.db.add(db_question)
        self.db.commit()
        self.db.refresh(db_question)
        return db_question
    
    def update_question(self, question_id: int, question_data: Dict[str, Any]) -> Optional[Question]:
        """Update a question"""
        db_question = self.get_question_by_id(question_id)
        if not db_question:
            return None
        
        for key, value in question_data.items():
            setattr(db_question, key, value)
        
        self.db.commit()
        self.db.refresh(db_question)
        return db_question
    
    def delete_question(self, question_id: int) -> bool:
        """Delete a question"""
        db_question = self.get_question_by_id(question_id)
        if not db_question:
            return False
        
        self.db.delete(db_question)
        self.db.commit()
        return True
    
    def get_question_stats(self) -> Dict[str, Any]:
        """Get question statistics"""
        total_questions = self.db.query(Question).count()
        questions_by_type = {}
        questions_by_difficulty = {}
        
        # Count by type
        for qtype in QuestionType:
            count = self.db.query(Question).filter(Question.question_type == qtype.value).count()
            questions_by_type[qtype.value] = count
        
        # Count by difficulty
        for difficulty in DifficultyLevel:
            count = self.db.query(Question).filter(Question.difficulty == difficulty.value).count()
            questions_by_difficulty[difficulty.value] = count
        
        return {
            "total_questions": total_questions,
            "by_type": questions_by_type,
            "by_difficulty": questions_by_difficulty
        }


class QuizService:
    """Service for managing quizzes"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_quiz(self, quiz_data: Dict[str, Any], created_by: int) -> Quiz:
        """Create a new quiz"""
        quiz_data['created_by'] = created_by
        db_quiz = Quiz(**quiz_data)
        self.db.add(db_quiz)
        self.db.commit()
        self.db.refresh(db_quiz)
        return db_quiz
    
    def get_quiz_by_id(self, quiz_id: int) -> Optional[Quiz]:
        """Get a quiz by ID"""
        return self.db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    def get_quizzes_for_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Quiz]:
        """Get quizzes created by a user"""
        return self.db.query(Quiz).filter(
            Quiz.created_by == user_id,
            Quiz.is_active == True
        ).offset(skip).limit(limit).all()
    
    def generate_quiz_questions(
        self,
        quiz_id: int,
        question_count: int,
        filters: Optional[QuestionFilter] = None
    ) -> List[QuizQuestion]:
        """Generate random questions for a quiz"""
        question_service = QuestionService(self.db)
        
        # Get filtered questions
        questions = question_service.get_questions(limit=1000, filters=filters)
        
        if len(questions) < question_count:
            raise ValueError(f"Not enough questions. Found {len(questions)}, needed {question_count}")
        
        # Randomly select questions
        selected_questions = random.sample(questions, question_count)
        
        # Create quiz questions
        quiz_questions = []
        for i, question in enumerate(selected_questions):
            quiz_question = QuizQuestion(
                quiz_id=quiz_id,
                question_id=question.id,
                order=i + 1
            )
            self.db.add(quiz_question)
            quiz_questions.append(quiz_question)
        
        self.db.commit()
        return quiz_questions
    
    def get_quiz_with_questions(self, quiz_id: int) -> Optional[Quiz]:
        """Get a quiz with its questions"""
        return self.db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    def submit_quiz_result(
        self,
        quiz_id: int,
        user_id: int,
        answers: List[QuizAnswer],
        time_taken: Optional[int] = None,
        started_at: Optional[datetime] = None
    ) -> QuizResult:
        """Submit and grade a quiz result"""
        quiz = self.get_quiz_with_questions(quiz_id)
        if not quiz:
            raise ValueError("Quiz not found")
        
        # Get quiz questions
        quiz_questions = self.db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz_id
        ).order_by(QuizQuestion.order).all()
        
        # Grade the quiz
        score = 0
        total_questions = len(quiz_questions)
        
        for quiz_question in quiz_questions:
            question = quiz_question.question
            user_answer = next((a for a in answers if a.question_id == question.id), None)
            
            if user_answer:
                # Check if answer is correct
                correct_answers = set(question.correct_answers)
                user_answers = set(user_answer.selected_answers)
                
                if correct_answers == user_answers:
                    score += 1
        
        percentage = int((score / total_questions) * 100) if total_questions > 0 else 0
        
        # Create quiz result
        result_data = {
            "quiz_id": quiz_id,
            "user_id": user_id,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "time_taken": time_taken,
            "answers": [answer.dict() for answer in answers],
            "started_at": started_at or datetime.utcnow()
        }
        
        db_result = QuizResult(**result_data)
        self.db.add(db_result)
        self.db.commit()
        self.db.refresh(db_result)
        
        return db_result
    
    def get_user_quiz_results(self, user_id: int, skip: int = 0, limit: int = 100) -> List[QuizResult]:
        """Get quiz results for a user"""
        return self.db.query(QuizResult).filter(
            QuizResult.user_id == user_id
        ).order_by(QuizResult.completed_at.desc()).offset(skip).limit(limit).all()
    
    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get user statistics"""
        results = self.db.query(QuizResult).filter(QuizResult.user_id == user_id).all()
        
        if not results:
            return {
                "total_quizzes": 0,
                "average_score": 0,
                "best_score": 0,
                "total_questions_answered": 0
            }
        
        total_quizzes = len(results)
        total_score = sum(r.score for r in results)
        total_questions = sum(r.total_questions for r in results)
        best_score = max(r.percentage for r in results)
        average_score = total_score / total_questions if total_questions > 0 else 0
        
        return {
            "total_quizzes": total_quizzes,
            "average_score": round(average_score * 100, 2),
            "best_score": best_score,
            "total_questions_answered": total_questions
        }


class FileUploadService:
    """Service for managing file uploads"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_uploaded_file(self, file_data: Dict[str, Any]) -> UploadedFile:
        """Create an uploaded file record"""
        db_file = UploadedFile(**file_data)
        self.db.add(db_file)
        self.db.commit()
        self.db.refresh(db_file)
        return db_file
    
    def update_file_status(
        self,
        file_id: int,
        status: str,
        error_message: Optional[str] = None,
        questions_count: Optional[int] = None
    ) -> Optional[UploadedFile]:
        """Update file processing status"""
        db_file = self.db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not db_file:
            return None
        
        db_file.processing_status = status
        if error_message:
            db_file.error_message = error_message
        if questions_count is not None:
            db_file.questions_count = questions_count
        
        self.db.commit()
        self.db.refresh(db_file)
        return db_file
    
    def get_user_files(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UploadedFile]:
        """Get files uploaded by a user"""
        return self.db.query(UploadedFile).filter(
            UploadedFile.uploaded_by == user_id
        ).order_by(UploadedFile.created_at.desc()).offset(skip).limit(limit).all()