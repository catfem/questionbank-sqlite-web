import React, { useState } from 'react';
import { questionService } from '../services/questionService';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessMessage from '../components/SuccessMessage';
import ErrorMessage from '../components/ErrorMessage';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({
    subject: '',
    chapter: '',
    difficulty: '',
    tags: '',
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid DOC or DOCX file');
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const uploadMetadata = {};
      if (metadata.subject) uploadMetadata.subject = metadata.subject;
      if (metadata.chapter) uploadMetadata.chapter = metadata.chapter;
      if (metadata.difficulty) uploadMetadata.difficulty = metadata.difficulty;
      if (metadata.tags) uploadMetadata.tags = metadata.tags;

      const response = await questionService.uploadFile(file, uploadMetadata);
      setResult(response);
      setFile(null);
      setMetadata({
        subject: '',
        chapter: '',
        difficulty: '',
        tags: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Questions</h1>
        <p className="text-gray-600 mt-2">
          Upload a DOCX file containing questions to automatically add them to your question bank.
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {result && <SuccessMessage message={result.message} />}

      <div className="space-y-6">
        {/* File Upload Area */}
        <div className="card">
          <div className="card-body">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="flex items-center justify-center">
                  <DocumentIcon className="w-12 h-12 text-primary-600 mr-4" />
                  <div className="text-left">
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="ml-4 p-2 text-gray-500 hover:text-red-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your DOCX file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports .doc and .docx files up to 10MB
                  </p>
                  <label className="btn btn-primary cursor-pointer">
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">File Metadata (Optional)</h3>
            <p className="text-sm text-gray-600">
              Add metadata to all questions in this file
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={(e) => handleMetadataChange('subject', e.target.value)}
                  placeholder="e.g., Mathematics, Science, History"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter
                </label>
                <input
                  type="text"
                  value={metadata.chapter}
                  onChange={(e) => handleMetadataChange('chapter', e.target.value)}
                  placeholder="e.g., Chapter 1, Algebra Basics"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={metadata.difficulty}
                  onChange={(e) => handleMetadataChange('difficulty', e.target.value)}
                  className="input"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => handleMetadataChange('tags', e.target.value)}
                  placeholder="e.g., algebra, equations, basics"
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn btn-primary flex items-center px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Uploading and Processing...</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                Upload Questions
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="card-body">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Supported Question Formats</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>Single Choice:</strong>
                <p className="mt-1">1. Which of the following is the capital of France? (A) London (B) Paris (C) Berlin (D) Madrid</p>
              </div>
              <div>
                <strong>Multiple Choice:</strong>
                <p className="mt-1">1. Select all correct statements about photosynthesis: (A) Produces oxygen (B) Requires sunlight (C) Occurs in animals (D) Uses chlorophyll</p>
              </div>
              <div>
                <strong>True/False:</strong>
                <p className="mt-1">1. The Earth is flat. (T/F)</p>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-4">
              Note: Questions should be numbered sequentially. Options should be in parentheses with letters (A), (B), (C), (D).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;