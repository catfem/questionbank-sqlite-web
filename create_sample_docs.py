#!/usr/bin/env python3
"""
Create sample DOCX files for testing
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.docx_parser import create_sample_docx

def create_sample_files():
    """Create sample DOCX files"""
    examples_dir = Path(__file__).parent / "examples"
    examples_dir.mkdir(exist_ok=True)
    
    # Sample questions 1 - Basic format
    questions_1 = [
        {
            'stem': 'What is the capital of France?',
            'options': ['London', 'Berlin', 'Paris', 'Madrid'],
            'correct_answer': [2],
            'question_type': 'single',
            'explanation': 'Paris is the capital and largest city of France.'
        },
        {
            'stem': 'Which of the following are programming languages?',
            'options': ['Python', 'HTML', 'Java', 'CSS'],
            'correct_answer': [0, 2],
            'question_type': 'multiple',
            'explanation': 'Python and Java are programming languages, while HTML and CSS are markup/styling languages.'
        },
        {
            'stem': 'The Earth is flat.',
            'options': ['True', 'False'],
            'correct_answer': [1],
            'question_type': 'true_false',
            'explanation': 'The Earth is approximately spherical in shape.'
        },
        {
            'stem': 'What is the largest planet in our solar system?',
            'options': ['Mars', 'Jupiter', 'Saturn', 'Earth'],
            'correct_answer': [1],
            'question_type': 'single',
            'explanation': 'Jupiter is the largest planet in our solar system.'
        },
        {
            'stem': 'Which of the following are web browsers?',
            'options': ['Chrome', 'Firefox', 'Safari', 'Photoshop'],
            'correct_answer': [0, 1, 2],
            'question_type': 'multiple',
            'explanation': 'Chrome, Firefox, and Safari are web browsers. Photoshop is an image editing software.'
        }
    ]
    
    # Sample questions 2 - Alternative format
    questions_2 = [
        {
            'stem': 'What is 2 + 2?',
            'options': ['3', '4', '5', '22'],
            'correct_answer': [1],
            'question_type': 'single',
            'explanation': '2 + 2 = 4'
        },
        {
            'stem': 'Which of the following are primary colors?',
            'options': ['Red', 'Green', 'Blue', 'Yellow'],
            'correct_answer': [0, 2, 3],
            'question_type': 'multiple',
            'explanation': 'In traditional color theory, red, blue, and yellow are primary colors.'
        },
        {
            'stem': 'The sun rises in the west.',
            'options': ['True', 'False'],
            'correct_answer': [1],
            'question_type': 'true_false',
            'explanation': 'The sun rises in the east and sets in the west.'
        },
        {
            'stem': 'Who painted the Mona Lisa?',
            'options': ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
            'correct_answer': [2],
            'question_type': 'single',
            'explanation': 'Leonardo da Vinci painted the Mona Lisa.'
        },
        {
            'stem': 'Which of the following are continents?',
            'options': ['Asia', 'Europe', 'Atlantic Ocean', 'Africa'],
            'correct_answer': [0, 1, 3],
            'question_type': 'multiple',
            'explanation': 'Asia, Europe, and Africa are continents. Atlantic Ocean is an ocean.'
        },
        {
            'stem': 'Water freezes at 0 degrees Celsius.',
            'options': ['True', 'False'],
            'correct_answer': [0],
            'question_type': 'true_false',
            'explanation': 'Water freezes at 0°C (32°F) at standard atmospheric pressure.'
        },
        {
            'stem': 'What is the smallest prime number?',
            'options': ['0', '1', '2', '3'],
            'correct_answer': [2],
            'question_type': 'single',
            'explanation': '2 is the smallest prime number. 0 and 1 are not prime numbers.'
        }
    ]
    
    # Create the files
    file1 = examples_dir / "sample_questions_1.docx"
    file2 = examples_dir / "sample_questions_2.docx"
    
    create_sample_docx(str(file1), questions_1)
    create_sample_docx(str(file2), questions_2)
    
    print(f"✅ Created {file1}")
    print(f"✅ Created {file2}")
    print(f"📊 File 1: {len(questions_1)} questions")
    print(f"📊 File 2: {len(questions_2)} questions")

if __name__ == "__main__":
    create_sample_files()