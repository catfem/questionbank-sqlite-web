import api from './api';

export const questionService = {
  // Get questions with filters
  getQuestions: async (params = {}) => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get question by ID
  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create question
  createQuestion: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Upload questions file
  uploadFile: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata if provided
    Object.keys(metadata).forEach(key => {
      if (metadata[key]) {
        formData.append(key, metadata[key]);
      }
    });

    const response = await api.post('/questions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get question statistics
  getStats: async () => {
    const response = await api.get('/questions/stats/summary');
    return response.data;
  },
};