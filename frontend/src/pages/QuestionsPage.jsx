import React, { useState, useEffect } from 'react';
import { questionService } from '../services/questionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  PlusIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    question_types: [],
    subjects: [],
    difficulty: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.question_types.length > 0) params.question_types = filters.question_types;
      if (filters.subjects.length > 0) params.subjects = filters.subjects;
      if (filters.difficulty.length > 0) params.difficulty = filters.difficulty;

      const data = await questionService.getQuestions(params);
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await questionService.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      question_types: [],
      subjects: [],
      difficulty: [],
    });
  };

  const getQuestionTypeColor = (type) => {
    const colors = {
      single: 'bg-blue-100 text-blue-800',
      multiple: 'bg-green-100 text-green-800',
      true_false: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600 mt-2">Manage your question bank</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="btn btn-primary flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filters */}
      {showFilters && (
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search questions..."
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type
                </label>
                <select
                  multiple
                  value={filters.question_types}
                  onChange={(e) => handleFilterChange('question_types', Array.from(e.target.selectedOptions, option => option.value))}
                  className="input h-20"
                >
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  multiple
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', Array.from(e.target.selectedOptions, option => option.value))}
                  className="input h-20"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by uploading a DOCX file with questions or create them manually.
              </p>
              <div className="flex justify-center space-x-3">
                <button className="btn btn-primary">
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Upload File
                </button>
                <button className="btn btn-secondary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Question
                </button>
              </div>
            </div>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="card">
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQuestionTypeColor(question.question_type)}`}>
                        {question.question_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {question.difficulty && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty.toUpperCase()}
                        </span>
                      )}
                      {question.subject && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {question.subject}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {question.question_text}
                    </h3>
                    
                    {/* Options */}
                    {question.options && question.options.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {question.options.map((option) => (
                          <div
                            key={option.key}
                            className={`text-sm p-2 rounded ${
                              question.correct_answers.includes(option.key)
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">{option.key}.</span> {option.text}
                            {question.correct_answers.includes(option.key) && (
                              <span className="ml-2 text-green-600 font-medium">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-primary-600">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
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

export default QuestionsPage;