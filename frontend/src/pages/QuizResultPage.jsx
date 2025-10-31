import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get result from location state or fetch it
    if (location.state?.result) {
      setResult(location.state.result);
      // We might need to fetch quiz details separately
      setLoading(false);
    } else {
      // If no result in state, we should fetch it based on the URL
      // For now, just redirect back to quizzes
      navigate('/quizzes');
    }
  }, [location.state, navigate]);

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return 'Excellent work!';
    if (percentage >= 60) return 'Good job!';
    if (percentage >= 40) return 'Keep practicing!';
    return 'Review the material and try again.';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Quiz result not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
        <p className="text-gray-600">Here's how you performed on the quiz</p>
      </div>

      {/* Score Card */}
      <div className="card mb-8">
        <div className="card-body text-center">
          <div className="mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <p className="text-xl text-gray-600 mt-2">
              {result.score} out of {result.total_questions} correct
            </p>
            <p className="text-lg text-gray-500 mt-1">
              {getScoreMessage(result.percentage)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-semibold text-gray-900">{result.score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {result.total_questions - result.score}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatTime(result.time_taken)}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quiz Information</h3>
          </div>
          <div className="card-body space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Quiz Title:</span>
              <span className="font-medium">Quiz #{result.quiz_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{formatDate(result.completed_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium">{result.total_questions}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Performance Breakdown</h3>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accuracy</span>
                <span className={`font-semibold ${getScoreColor(result.percentage)}`}>
                  {result.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    result.percentage >= 80 ? 'bg-green-500' :
                    result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/quizzes')}
          className="btn btn-secondary"
        >
          Back to Quizzes
        </button>
        <button
          onClick={() => navigate('/results')}
          className="btn btn-primary"
        >
          View All Results
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;