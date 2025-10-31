import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  PlusIcon,
  PlayIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizzes();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      setError('Failed to delete quiz');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-600 mt-2">Create and manage your quizzes</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/quizzes/generate"
            className="btn btn-secondary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Generate Quiz
          </Link>
          <Link
            to="/quizzes/create"
            className="btn btn-primary flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Quiz
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <PlayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quizzes yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first quiz to get started with testing your knowledge.
              </p>
              <div className="flex justify-center space-x-3">
                <Link
                  to="/quizzes/generate"
                  className="btn btn-secondary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Link>
                <Link
                  to="/quizzes/create"
                  className="btn btn-primary"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Quiz
                </Link>
              </div>
            </div>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="card">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {quiz.title}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    
                    {quiz.description && (
                      <p className="text-gray-600 mb-3">{quiz.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <PlayIcon className="w-4 h-4 mr-1" />
                        {quiz.question_count} questions
                      </div>
                      {quiz.time_limit && (
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {quiz.time_limit} minutes
                        </div>
                      )}
                      <div>
                        Created {formatDate(quiz.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Link
                      to={`/quizzes/${quiz.id}/take`}
                      className="btn btn-primary flex items-center"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Take Quiz
                    </Link>
                    <Link
                      to={`/quizzes/${quiz.id}/results`}
                      className="btn btn-secondary flex items-center"
                    >
                      <ChartBarIcon className="w-4 h-4 mr-2" />
                      Results
                    </Link>
                    <button className="p-2 text-gray-600 hover:text-primary-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;