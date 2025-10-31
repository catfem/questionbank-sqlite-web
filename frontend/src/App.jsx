import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuestionsPage from './pages/QuestionsPage';
import UploadPage from './pages/UploadPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultPage from './pages/QuizResultPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';

import './index.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex">
                      {/* Sidebar */}
                      <Sidebar />
                      
                      {/* Main Content */}
                      <div className="flex-1">
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route path="/questions" element={<QuestionsPage />} />
                          <Route path="/upload" element={<UploadPage />} />
                          <Route path="/quizzes" element={<QuizzesPage />} />
                          <Route path="/quizzes/:id/take" element={<QuizTakingPage />} />
                          <Route path="/quizzes/:id/result" element={<QuizResultPage />} />
                          <Route path="/results" element={<ResultsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          
                          {/* Fallback */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;