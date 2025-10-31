import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Tag {
  id: number
  name: string
}

interface QuizGenerationRequest {
  topic?: string
  question_type?: string
  difficulty?: string
  count: number
  tag_ids?: number[]
}

const QuizGenerator: React.FC = () => {
  const [formData, setFormData] = useState<QuizGenerationRequest>({
    count: 10,
  })
  const navigate = useNavigate()

  const { data: tags } = useQuery<Tag[]>('tags', () =>
    axios.get('/api/tags').then(res => res.data)
  )

  const generateMutation = useMutation(
    (request: QuizGenerationRequest) => axios.post('/api/quizzes/generate', request),
    {
      onSuccess: (response) => {
        const quizId = response.data.id
        navigate(`/quiz/${quizId}/take`)
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateMutation.mutate(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'count' ? parseInt(value) || 1 : value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generate Quiz</h1>
        <p className="mt-2 text-gray-600">
          Create a new quiz by selecting criteria for the questions.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              Topic (Optional)
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Mathematics, Science, History"
            />
          </div>

          {/* Question Type */}
          <div>
            <label htmlFor="question_type" className="block text-sm font-medium text-gray-700">
              Question Type (Optional)
            </label>
            <select
              id="question_type"
              name="question_type"
              value={formData.question_type || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="single">Single Choice</option>
              <option value="multiple">Multiple Choice</option>
              <option value="true_false">True/False</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Difficulty (Optional)
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              id="count"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={formData.tag_ids?.includes(tag.id) || false}
                      onChange={(e) => {
                        const tagIds = formData.tag_ids || []
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            tag_ids: [...tagIds, tag.id]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            tag_ids: tagIds.filter(id => id !== tag.id)
                          }))
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generateMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateMutation.isLoading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </form>
      </div>

      {/* Example Quiz Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Questions will be randomly selected based on your criteria</li>
          <li>If no criteria are specified, questions will be selected from the entire bank</li>
          <li>You can adjust the number of questions (1-50)</li>
          <li>After generation, you'll be taken directly to the quiz interface</li>
        </ul>
      </div>
    </div>
  )
}

export default QuizGenerator