import api from './api';

export const userService = {
  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update current user
  updateCurrentUser: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/users/me/stats');
    return response.data;
  },
};