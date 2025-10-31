import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/quizService';
import { questionService } from '../services/questionService';
import {
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    questionStats: {},
    quizStats: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [questionStats, quizStats] = await Promise.all([
          questionService.getStats(),
          quizService.getMyStats(),
        ]);

        setStats({
          questionStats,
          quizStats,
          loading: false,
          error: null,
        });
      } catch (error) {
        setStats({
          questionStats: {},
          quizStats: {},
          loading: false,
          error: 'Failed to load statistics',
        });
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Upload Questions',
      description: 'Add questions from a DOCX file',
      icon: DocumentTextIcon,
      href: '/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Create Quiz',
      description: 'Generate a new quiz from questions',
      icon: AcademicCapIcon,
      href: '/quizzes/create',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Questions',
      description: 'View and edit question bank',
      icon: QuestionMarkCircleIcon,
      href: '/questions',
      color: 'bg-purple-500',
    },
    {
      title: 'View Results',
      description: 'Check your quiz history',
      icon: ChartBarIcon,
      href: '/results',
      color: 'bg-orange-500',
    },
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your question bank and quiz activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Questions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.questionStats.total_questions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quizzes Taken</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.quizStats.total_quizzes || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.quizStats.average_score || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Best Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.quizStats.best_score || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="card-body">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          <div className="card-body">
            <div className="text-center py-8">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity to display</p>
              <p className="text-sm text-gray-500 mt-2">
                Start by uploading questions or creating a quiz!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;