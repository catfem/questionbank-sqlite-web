import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'

interface Question {
  id: number
  stem: string
  question_type: 'single' | 'multiple' | 'true_false'
  options: Array<{
    id: number
    text: string
    label: string
  }>
}

interface Quiz {
  id: number
  title: string
  description?: string
  question_ids: number[]
}

const QuizTaker: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({})

  const { data: quiz } = useQuery<Quiz>(
    ['quiz', quizId],
    () => axios.get(`/api/quizzes/${quizId}`).then(res => res.data),
    {
      enabled: !!quizId,
    }
  )

  const { data: questions } = useQuery<Question[]>(
    ['quiz-questions', quiz?.question_ids],
    async () => {
      if (!quiz?.question_ids) return []
      const promises = quiz.question_ids.map(id =>
        axios.get(`/api/questions/${id}`).then(res => res.data)
      )
      return Promise.all(promises)
    },
    {
      enabled: !!quiz?.question_ids,
    }
  )

  const submitMutation = useMutation(
    (data: { quizId: number; selectedAnswers: Record<number, number[]> }) =>
      axios.post(`/api/quizzes/${data.quizId}/attempt`, {
        quiz_id: data.quizId,
        selected_answers: data.selectedAnswers,
      }),
    {
      onSuccess: () => {
        navigate('/history')
      },
    }
  )

  const currentQuestion = questions?.[currentQuestionIndex]
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => {
      const current = prev[questionId] || []
      
      if (currentQuestion?.question_type === 'single') {
        // Single choice: replace current selection
        return { ...prev, [questionId]: [optionIndex] }
      } else if (currentQuestion?.question_type === 'multiple') {
        // Multiple choice: toggle selection
        if (current.includes(optionIndex)) {
          return { ...prev, [questionId]: current.filter(i => i !== optionIndex) }
        } else {
          return { ...prev, [questionId]: [...current, optionIndex] }
        }
      } else if (currentQuestion?.question_type === 'true_false') {
        // True/False: single selection
        return { ...prev, [questionId]: [optionIndex] }
      }
      
      return prev
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (!quiz) return
    
    submitMutation.mutate({
      quizId: parseInt(quizId!),
      selectedAnswers,
    })
  }

  const isAnswerSelected = (questionId: number, optionIndex: number) => {
    return selectedAnswers[questionId]?.includes(optionIndex) || false
  }

  if (!quiz || !questions || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading quiz...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        {quiz.description && (
          <p className="mt-2 text-gray-600">{quiz.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentQuestion.question_type === 'single' ? 'bg-blue-100 text-blue-800' :
              currentQuestion.question_type === 'multiple' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {currentQuestion.question_type === 'single' ? 'Single Choice' :
               currentQuestion.question_type === 'multiple' ? 'Multiple Choice' :
               'True/False'}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.stem}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => (
              <div
                key={option.id}
                onClick={() => handleAnswerSelect(currentQuestion.id, optionIndex)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isAnswerSelected(currentQuestion.id, optionIndex)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    isAnswerSelected(currentQuestion.id, optionIndex)
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {isAnswerSelected(currentQuestion.id, optionIndex) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900 mr-3">
                    {option.label}.
                  </span>
                  <span className="text-gray-700">{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="text-sm text-gray-500">
          {Object.keys(selectedAnswers).length} of {questions.length} questions answered
        </div>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next
          </button>
        )}
      </div>

      {/* Question Navigation */}
      <div className="mt-8 bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`p-2 text-sm font-medium rounded ${
                index === currentQuestionIndex
                  ? 'bg-indigo-600 text-white'
                  : selectedAnswers[question.id]
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuizTaker