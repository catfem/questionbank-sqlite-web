#!/usr/bin/env python3
"""
Demo setup script for Question Bank & Quiz System

This script:
1. Sets up the database
2. Creates an admin user
3. Loads sample questions
4. Demonstrates the quiz generation
"""

import os
import sys
import sqlite3
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.models import create_tables, SessionLocal, User, Question, Option, Tag
from backend.docx_parser import DocxParser

def setup_database():
    """Initialize the database tables"""
    print("🔧 Setting up database...")
    create_tables()
    print("✅ Database tables created successfully")

def create_admin_user():
    """Create an admin user for demo purposes"""
    print("👤 Creating admin user...")
    
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_admin:
            print("ℹ️  Admin user already exists")
            return existing_admin
        
        # Create demo admin user
        admin_user = User(
            email="admin@example.com",
            name="Demo Admin",
            google_id="demo_admin_12345",
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created: {admin_user.email}")
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def load_sample_questions():
    """Load sample questions from the example DOCX files"""
    print("📚 Loading sample questions...")
    
    # Check if example files exist
    examples_dir = Path(__file__).parent / "examples"
    if not examples_dir.exists():
        print("❌ Examples directory not found")
        return
    
    sample_files = [
        examples_dir / "sample_questions_1.docx",
        examples_dir / "sample_questions_2.docx"
    ]
    
    db = SessionLocal()
    try:
        total_loaded = 0
        
        for file_path in sample_files:
            if not file_path.exists():
                print(f"⚠️  Sample file not found: {file_path}")
                continue
            
            print(f"📄 Parsing {file_path.name}...")
            
            # Parse the DOCX file
            parser = DocxParser()
            questions, errors = parser.parse_document(str(file_path))
            
            print(f"   📊 Found {len(questions)} questions, {len(errors)} errors")
            
            # Save questions to database
            for parsed_q in questions:
                # Check if question already exists (by stem)
                existing = db.query(Question).filter(Question.stem == parsed_q.stem).first()
                if existing:
                    continue
                
                # Create question
                db_question = Question(
                    stem=parsed_q.stem,
                    question_type=parsed_q.question_type,
                    correct_answer=parsed_q.correct_answer,
                    explanation=parsed_q.explanation,
                    difficulty=parsed_q.difficulty
                )
                db.add(db_question)
                db.flush()  # Get the ID
                
                # Add options
                for i, option in enumerate(parsed_q.options):
                    db_option = Option(
                        question_id=db_question.id,
                        text=option['text'],
                        label=option['label'],
                        order_index=i
                    )
                    db.add(db_option)
                
                total_loaded += 1
            
            # Show errors
            if errors:
                print(f"   ⚠️  Errors in {file_path.name}:")
                for error in errors[:3]:  # Show first 3 errors
                    print(f"      Line {error['line_number']}: {error['error']}")
                if len(errors) > 3:
                    print(f"      ... and {len(errors) - 3} more errors")
        
        db.commit()
        print(f"✅ Loaded {total_loaded} sample questions into database")
        
    except Exception as e:
        print(f"❌ Error loading sample questions: {e}")
        db.rollback()
    finally:
        db.close()

def create_sample_tags():
    """Create sample tags for categorizing questions"""
    print("🏷️  Creating sample tags...")
    
    db = SessionLocal()
    try:
        tag_names = ["general", "science", "mathematics", "geography", "history", "technology"]
        
        for tag_name in tag_names:
            existing = db.query(Tag).filter(Tag.name == tag_name).first()
            if not existing:
                tag = Tag(name=tag_name)
                db.add(tag)
        
        db.commit()
        print(f"✅ Created {len(tag_names)} sample tags")
        
    except Exception as e:
        print(f"❌ Error creating tags: {e}")
        db.rollback()
    finally:
        db.close()

def show_database_stats():
    """Show current database statistics"""
    print("📊 Database Statistics:")
    
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        question_count = db.query(Question).count()
        option_count = db.query(Option).count()
        tag_count = db.query(Tag).count()
        
        print(f"   👤 Users: {user_count}")
        print(f"   ❓ Questions: {question_count}")
        print(f"   📝 Options: {option_count}")
        print(f"   🏷️  Tags: {tag_count}")
        
        # Show question breakdown by type
        single_choice = db.query(Question).filter(Question.question_type == 'single').count()
        multiple_choice = db.query(Question).filter(Question.question_type == 'multiple').count()
        true_false = db.query(Question).filter(Question.question_type == 'true_false').count()
        
        print(f"   📈 Question Types:")
        print(f"      Single Choice: {single_choice}")
        print(f"      Multiple Choice: {multiple_choice}")
        print(f"      True/False: {true_false}")
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
    finally:
        db.close()

def print_next_steps():
    """Print instructions for running the demo"""
    print("\n🚀 Next Steps:")
    print("1. Start the backend server:")
    print("   cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print()
    print("2. Start the frontend server (in a new terminal):")
    print("   cd frontend && npm run dev")
    print()
    print("3. Open your browser and go to:")
    print("   http://localhost:5173")
    print()
    print("4. Sign in with Google OAuth (you'll need to set up credentials)")
    print()
    print("5. As admin, you can:")
    print("   - Upload additional DOCX files")
    print("   - View and edit questions")
    print("   - Generate quizzes")
    print("   - View quiz history")
    print()
    print("📋 For Google OAuth setup:")
    print("   1. Go to https://console.cloud.google.com/")
    print("   2. Create OAuth 2.0 credentials")
    print("   3. Add redirect URI: http://localhost:5173/auth/callback")
    print("   4. Copy Client ID and Secret to backend/.env")
    print()
    print("🔑 Admin credentials for testing:")
    print("   Email: admin@example.com")
    print("   (This is a demo account - use Google OAuth to sign in)")

def main():
    """Main demo setup function"""
    print("🎯 Question Bank & Quiz System - Demo Setup")
    print("=" * 50)
    
    # Change to project directory
    os.chdir(Path(__file__).parent)
    
    try:
        # Setup steps
        setup_database()
        create_admin_user()
        create_sample_tags()
        load_sample_questions()
        show_database_stats()
        print_next_steps()
        
        print("\n✅ Demo setup completed successfully!")
        
    except KeyboardInterrupt:
        print("\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()