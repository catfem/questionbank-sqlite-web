import api from './api';

export const quizService = {
  // Get quizzes
  getQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  // Get quiz by ID
  getQuiz: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  // Create quiz
  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  // Generate quiz with filters
  generateQuiz: async (quizRequest) => {
    const response = await api.post('/quizzes/generate', quizRequest);
    return response.data;
  },

  // Get quiz questions
  getQuizQuestions: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  // Submit quiz
  submitQuiz: async (quizId, answers, timeTaken) => {
    const response = await api.post(`/quizzes/${quizId}/submit`, {
      quiz_id: quizId,
      answers,
      time_taken: timeTaken,
    });
    return response.data;
  },

  // Get quiz results
  getQuizResults: async (quizId, params = {}) => {
    const response = await api.get(`/quizzes/${quizId}/results`, { params });
    return response.data;
  },

  // Get user's quiz results
  getMyResults: async (params = {}) => {
    const response = await api.get('/quizzes/results/my-results', { params });
    return response.data;
  },

  // Get user statistics
  getMyStats: async () => {
    const response = await api.get('/quizzes/stats/my-stats');
    return response.data;
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },
};