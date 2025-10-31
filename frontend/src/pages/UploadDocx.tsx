import React, { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import axios from 'axios'

interface ImportReport {
  id: number
  filename: string
  total_lines: number
  successful_imports: number
  failed_imports: number
  errors: Array<{
    line_number: number
    content: string
    error: string
  }>
  created_at: string
}

const UploadDocx: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadResult, setUploadResult] = useState<ImportReport | null>(null)

  const queryClient = useQueryClient()

  const uploadMutation = useMutation(
    (formData: FormData) => axios.post('/api/upload-docx', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    {
      onSuccess: (response) => {
        setUploadResult(response.data)
        setUploadStatus('success')
        queryClient.invalidateQueries('import-reports')
      },
      onError: () => {
        setUploadStatus('error')
      },
    }
  )

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file)
      setUploadStatus('idle')
      setUploadResult(null)
    } else {
      alert('Please select a valid .docx file')
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)

    setUploadStatus('uploading')
    uploadMutation.mutate(formData)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setUploadResult(null)
    const input = document.getElementById('file-input') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Questions</h1>
        <p className="mt-2 text-gray-600">
          Upload a DOCX file containing questions to import them into the question bank.
        </p>
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Supported Format:</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Questions should start with numbers (1., 2., etc.) or "Question X"</li>
          <li>Options should be labeled with letters (A., B., C., D., etc.)</li>
          <li>Answers should be marked with "Answer: X" (use commas for multiple answers)</li>
          <li>Optional: Add explanations with "Explanation: text"</li>
          <li>Optional: Set difficulty with "Difficulty: easy/medium/hard"</li>
        </ul>
      </div>

      {/* File Upload */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <label htmlFor="file-input" className="cursor-pointer">
              <div className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                selectedFile ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <>
                      <DocumentIcon className="mx-auto h-12 w-12 text-indigo-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="font-medium text-indigo-600 truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-input"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-input"
                            name="file-input"
                            type="file"
                            className="sr-only"
                            accept=".docx"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">DOCX files only</p>
                    </>
                  )}
                </div>
              </div>
            </label>

            {selectedFile && (
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload File'}
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Result */}
      {uploadStatus === 'success' && uploadResult && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Upload Complete</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">File</p>
                <p className="text-lg font-semibold text-gray-900">{uploadResult.filename}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-500">Successful</p>
                <p className="text-lg font-semibold text-green-900">{uploadResult.successful_imports}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-500">Failed</p>
                <p className="text-lg font-semibold text-red-900">{uploadResult.failed_imports}</p>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Import Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <ul className="space-y-2">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-800">
                            <strong>Line {error.line_number}:</strong> {error.error}
                          </p>
                          <p className="text-xs text-red-600 mt-1">{error.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
              <p className="mt-2 text-sm text-red-700">
                There was an error uploading your file. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadDocx