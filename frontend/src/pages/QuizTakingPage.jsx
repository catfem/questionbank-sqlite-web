import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService } from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const QuizTakingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  useEffect(() => {
    if (quiz?.time_limit && startTime) {
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = quiz.time_limit * 60 - elapsed;
        
        if (remaining <= 0) {
          handleSubmitQuiz();
          clearInterval(timer);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, startTime]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        quizService.getQuiz(id),
        quizService.getQuizQuestions(id),
      ]);

      setQuiz(quizData);
      setQuestions(questionsData);
      setStartTime(Date.now());
      
      // Initialize answers object
      const initialAnswers = {};
      questionsData.forEach((q) => {
        initialAnswers[q.question.id] = [];
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    const question = questions.find(q => q.question.id === questionId);
    
    if (question.question.question_type === 'single') {
      // For single choice, replace the array with the single value
      setAnswers(prev => ({
        ...prev,
        [questionId]: value ? [value] : []
      }));
    } else if (question.question.question_type === 'multiple') {
      // For multiple choice, toggle the value in the array
      setAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(value)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(a => a !== value)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, value]
          };
        }
      });
    } else if (question.question.question_type === 'true_false') {
      // For true/false, replace the array with the single value
      setAnswers(prev => ({
        ...prev,
        [questionId]: value ? [value] : []
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
      
      // Convert answers to the expected format
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswers]) => ({
        question_id: parseInt(questionId),
        selected_answers: selectedAnswers
      }));

      const result = await quizService.submitQuiz(id, formattedAnswers, timeTaken);
      navigate(`/quizzes/${id}/result`, { state: { result } });
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const answered = Object.values(answers).filter(a => a.length > 0).length;
    return (answered / questions.length) * 100;
  };

  const currentQuestion = questions[currentQuestionIndex]?.question;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!quiz || !currentQuestion) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Quiz not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {timeLeft !== null && (
            <div className={`flex items-center px-3 py-1 rounded-full ${
              timeLeft < 60 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <ClockIcon className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(getProgress())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.question_text}
            </h2>
            
            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.key}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id]?.includes(option.key)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type={
                        currentQuestion.question_type === 'multiple'
                          ? 'checkbox'
                          : 'radio'
                      }
                      name={`question-${currentQuestion.id}`}
                      value={option.key}
                      checked={answers[currentQuestion.id]?.includes(option.key)}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium mr-2">{option.key}.</span>
                    <span>{option.text}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-full font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 text-white'
                  : answers[questions[index].question.id]?.length > 0
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            className="btn btn-primary flex items-center"
          >
            Next
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Submit Quiz'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizTakingPage;