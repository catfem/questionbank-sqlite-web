import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await quizService.getMyResults();
      setResults(data);
      setError(null);
    } catch (err) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
        <p className="text-gray-600 mt-2">Review your quiz history and performance</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {results.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quiz results yet
            </h3>
            <p className="text-gray-600 mb-4">
              Take your first quiz to see your results here.
            </p>
            <Link
              to="/quizzes"
              className="btn btn-primary"
            >
              Take a Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="card">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Quiz #{result.quiz_id}
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getScoreBgColor(result.percentage)} ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Score</p>
                          <p className="font-semibold">
                            {result.score}/{result.total_questions}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-semibold">{formatTime(result.time_taken)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Incorrect</p>
                          <p className="font-semibold">
                            {result.total_questions - result.score}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="font-semibold">{formatDate(result.completed_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Link
                      to={`/quizzes/${result.quiz_id}/result`}
                      state={{ result }}
                      className="btn btn-secondary flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.percentage >= 80 ? 'bg-green-500' :
                        result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;