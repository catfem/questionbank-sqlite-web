import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <AcademicCapIcon className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              Question Bank System
            </span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="flex space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/questions"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Questions
              </Link>
              <Link
                to="/quizzes"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Quizzes
              </Link>
            </nav>
          )}

          {/* User menu */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;