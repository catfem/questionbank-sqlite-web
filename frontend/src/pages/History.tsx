import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import axios from 'axios'

interface QuizAttempt {
  id: number
  quiz: {
    id: number
    title: string
    description?: string
  }
  score: number
  total_questions: number
  correct_answers: number
  started_at: string
  completed_at: string
  selected_answers: Record<number, number[]>
}

const History: React.FC = () => {
  const { data: attempts, isLoading } = useQuery<QuizAttempt[]>(
    'history',
    () => axios.get('/api/history').then(res => res.data)
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircleIcon
    if (score >= 60) return ClockIcon
    return XCircleIcon
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading history...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quiz History</h1>
        <p className="mt-2 text-gray-600">
          Review your past quiz attempts and track your progress.
        </p>
      </div>

      {attempts && attempts.length > 0 ? (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attempts.length > 0
                      ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attempts.reduce((sum, a) => sum + a.total_questions, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Correct Answers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {attempts.reduce((sum, a) => sum + a.correct_answers, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attempts List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Attempts
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attempts.map((attempt) => {
                      const ScoreIcon = getScoreIcon(attempt.score)
                      const startTime = new Date(attempt.started_at)
                      const endTime = new Date(attempt.completed_at)
                      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000) // minutes
                      
                      return (
                        <tr key={attempt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {attempt.quiz.title}
                              </div>
                              {attempt.quiz.description && (
                                <div className="text-sm text-gray-500">
                                  {attempt.quiz.description}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(attempt.score)}`}>
                              <ScoreIcon className="h-4 w-4 mr-1" />
                              {attempt.score.toFixed(1)}%
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {attempt.correct_answers}/{attempt.total_questions} correct
                            </div>
                            <div className="text-sm text-gray-500">
                              {((attempt.correct_answers / attempt.total_questions) * 100).toFixed(1)}%
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
                            {new Date(attempt.completed_at).toLocaleTimeString()}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {duration} min{duration !== 1 ? 's' : ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quiz attempts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating and taking your first quiz.
            </p>
            <div className="mt-6">
              <Link
                to="/quiz/generate"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Quiz
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History