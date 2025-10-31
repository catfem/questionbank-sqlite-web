import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import {
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  TrophyIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import axios from 'axios'

interface Stats {
  totalQuestions: number
  totalQuizzes: number
  recentAttempts: number
  averageScore: number
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const { data: stats } = useQuery<Stats>('dashboard-stats', async () => {
    const [questionsRes, historyRes] = await Promise.all([
      axios.get('/api/questions'),
      axios.get('/api/history?limit=10'),
    ])

    const questions = questionsRes.data
    const attempts = historyRes.data

    return {
      totalQuestions: questions.length,
      totalQuizzes: 10, // This would come from a real endpoint
      recentAttempts: attempts.length,
      averageScore: attempts.length > 0
        ? attempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / attempts.length
        : 0,
    }
  })

  const { data: recentHistory } = useQuery('recent-history', () =>
    axios.get('/api/history?limit=5').then(res => res.data)
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your quiz system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QuestionMarkCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Questions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalQuestions || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Quizzes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalQuizzes || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Recent Attempts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.recentAttempts || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Score
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload Questions
            </Link>
            <Link
              to="/questions"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Questions
            </Link>
            <Link
              to="/quiz/generate"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Quiz
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View History
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentHistory && recentHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Quiz Attempts
            </h3>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {recentHistory.map((attempt: any) => (
                  <li key={attempt.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          attempt.score >= 80 ? 'bg-green-100' :
                          attempt.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            attempt.score >= 80 ? 'text-green-800' :
                            attempt.score >= 60 ? 'text-yellow-800' : 'text-red-800'
                          }`}>
                            {attempt.score.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attempt.quiz.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {attempt.correct_answers}/{attempt.total_questions} correct
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                to="/history"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all history &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard