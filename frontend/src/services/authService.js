import api from './api';

export const authService = {
  // Get Google OAuth URL
  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google');
    return response.data;
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (code) => {
    const response = await api.post('/auth/google/callback', { code });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get stored user
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};