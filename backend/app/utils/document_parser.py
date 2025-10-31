import re
import json
from typing import List, Dict, Any, Optional, Tuple
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Pt
import logging

logger = logging.getLogger(__name__)


class QuestionParser:
    """Parser for extracting questions from DOCX files"""
    
    def __init__(self):
        self.questions = []
        self.current_question = None
        self.question_number_pattern = re.compile(r'^(\d+)\.\s*(.*)')
        self.option_pattern = re.compile(r'^\(([A-Z])\)\s*(.*)')
        self.true_false_pattern = re.compile(r'\(T/F\)|\(TRUE/FALSE\)', re.IGNORECASE)
        self.multiple_choice_keywords = [
            'select all', 'choose all', 'which of the following are', 
            'multiple correct', 'all that apply', 'select all that apply'
        ]
    
    def parse_document(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse a DOCX file and extract questions"""
        try:
            doc = Document(file_path)
            self.questions = []
            self.current_question = None
            
            for paragraph in doc.paragraphs:
                text = paragraph.text.strip()
                if not text:
                    continue
                
                self._process_paragraph(text)
            
            # Process any remaining question
            if self.current_question:
                self._finalize_question()
            
            return self.questions
            
        except Exception as e:
            logger.error(f"Error parsing document: {str(e)}")
            raise ValueError(f"Failed to parse document: {str(e)}")
    
    def _process_paragraph(self, text: str):
        """Process a single paragraph from the document"""
        # Check if it's a new question
        question_match = self.question_number_pattern.match(text)
        if question_match:
            # Save previous question if exists
            if self.current_question:
                self._finalize_question()
            
            # Start new question
            question_text = question_match.group(2)
            self.current_question = {
                'question_text': question_text,
                'question_type': None,
                'options': [],
                'correct_answers': [],
                'explanation': None,
                'tags': []
            }
            
            # Determine question type
            self._determine_question_type(question_text)
            return
        
        # Check if it's an option
        option_match = self.option_pattern.match(text)
        if option_match and self.current_question:
            option_key = option_match.group(1)
            option_text = option_match.group(2)
            
            # Check if this option is marked as correct
            is_correct = self._is_correct_option(option_text)
            option_text = self._clean_option_text(option_text)
            
            self.current_question['options'].append({
                'key': option_key,
                'text': option_text
            })
            
            if is_correct:
                self.current_question['correct_answers'].append(option_key)
            return
        
        # Check for true/false questions
        if self.current_question and self.true_false_pattern.search(text):
            if self.current_question['question_type'] is None:
                self.current_question['question_type'] = 'true_false'
                self.current_question['options'] = [
                    {'key': 'T', 'text': 'True'},
                    {'key': 'F', 'text': 'False'}
                ]
                
                # Try to detect the correct answer
                correct_answer = self._extract_true_false_answer(text)
                if correct_answer:
                    self.current_question['correct_answers'] = [correct_answer]
            return
        
        # Check for explanation
        if self.current_question and text.lower().startswith(('explanation:', 'answer:', 'solution:')):
            explanation = text.split(':', 1)[1].strip()
            self.current_question['explanation'] = explanation
            return
        
        # Additional text for current question
        if self.current_question and not text.startswith(('(', 'A)', 'B)', 'C)', 'D)')):
            # Append to question text
            self.current_question['question_text'] += ' ' + text
    
    def _determine_question_type(self, question_text: str):
        """Determine the type of question based on the text"""
        question_lower = question_text.lower()
        
        # Check for multiple choice keywords
        for keyword in self.multiple_choice_keywords:
            if keyword in question_lower:
                self.current_question['question_type'] = 'multiple'
                return
        
        # Check for true/false pattern
        if self.true_false_pattern.search(question_text):
            self.current_question['question_type'] = 'true_false'
            return
        
        # Default to single choice
        self.current_question['question_type'] = 'single'
    
    def _is_correct_option(self, option_text: str) -> bool:
        """Check if an option is marked as correct"""
        # Look for indicators of correct answers
        correct_indicators = ['✓', '✔', '✅', '(correct)', '(right)', '(answer)']
        option_lower = option_text.lower()
        
        for indicator in correct_indicators:
            if indicator in option_lower:
                return True
        
        # Check if option ends with common answer indicators
        if option_lower.endswith(('correct', 'right', 'answer')):
            return True
        
        return False
    
    def _clean_option_text(self, option_text: str) -> str:
        """Clean option text by removing correct answer indicators"""
        # Remove correct answer indicators
        patterns_to_remove = [
            r'\s*✓\s*',
            r'\s*✔\s*',
            r'\s*✅\s*',
            r'\s*\(correct\)\s*',
            r'\s*\(right\)\s*',
            r'\s*\(answer\)\s*$',
            r'\s*correct\s*$',
            r'\s*right\s*$',
            r'\s*answer\s*$'
        ]
        
        cleaned_text = option_text
        for pattern in patterns_to_remove:
            cleaned_text = re.sub(pattern, '', cleaned_text, flags=re.IGNORECASE)
        
        return cleaned_text.strip()
    
    def _extract_true_false_answer(self, text: str) -> Optional[str]:
        """Extract the correct answer for true/false questions"""
        text_lower = text.lower()
        
        # Look for explicit answer indicators
        if any(indicator in text_lower for indicator in ['true', 'correct', 'yes']):
            return 'T'
        elif any(indicator in text_lower for indicator in ['false', 'incorrect', 'no']):
            return 'F'
        
        return None
    
    def _finalize_question(self):
        """Finalize and validate the current question"""
        if not self.current_question:
            return
        
        # Validate question
        if not self.current_question['question_text'].strip():
            logger.warning("Skipping question with empty text")
            return
        
        # Set default options for true/false if not set
        if self.current_question['question_type'] == 'true_false' and not self.current_question['options']:
            self.current_question['options'] = [
                {'key': 'T', 'text': 'True'},
                {'key': 'F', 'text': 'False'}
            ]
        
        # For single choice questions, if no correct answer is marked, assume the first option is correct
        if (self.current_question['question_type'] == 'single' and 
            not self.current_question['correct_answers'] and 
            self.current_question['options']):
            self.current_question['correct_answers'] = [self.current_question['options'][0]['key']]
        
        # Ensure correct answers are provided
        if not self.current_question['correct_answers']:
            logger.warning(f"Question has no correct answers: {self.current_question['question_text'][:50]}...")
            return
        
        # Add to questions list
        self.questions.append(self.current_question.copy())
        self.current_question = None


def parse_docx_file(file_path: str, metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Parse a DOCX file and return a list of questions
    
    Args:
        file_path: Path to the DOCX file
        metadata: Optional metadata to include with questions
    
    Returns:
        List of question dictionaries
    """
    parser = QuestionParser()
    questions = parser.parse_document(file_path)
    
    # Add metadata to questions if provided
    if metadata:
        for question in questions:
            question.update(metadata)
    
    logger.info(f"Successfully parsed {len(questions)} questions from {file_path}")
    return questions


def validate_question_data(question_data: Dict[str, Any]) -> bool:
    """Validate question data structure"""
    required_fields = ['question_text', 'question_type', 'correct_answers']
    
    for field in required_fields:
        if field not in question_data or not question_data[field]:
            return False
    
    # Validate question type
    valid_types = ['single', 'multiple', 'true_false']
    if question_data['question_type'] not in valid_types:
        return False
    
    # For non-true-false questions, options are required
    if question_data['question_type'] != 'true_false':
        if 'options' not in question_data or not question_data['options']:
            return False
    
    return True