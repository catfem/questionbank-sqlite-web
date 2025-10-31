import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from '../components/Icons';

const LoginPage = () => {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // In a real app, this would redirect to Google OAuth
      // For demo purposes, we'll simulate a successful login
      const mockCode = 'mock_google_auth_code';
      await login(mockCode);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the Question Bank and Quiz System
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;