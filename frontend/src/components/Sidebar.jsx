import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Questions', href: '/questions', icon: QuestionMarkCircleIcon },
    { name: 'Upload File', href: '/upload', icon: DocumentTextIcon },
    { name: 'Quizzes', href: '/quizzes', icon: AcademicCapIcon },
    { name: 'Results', href: '/results', icon: ChartBarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 bg-gray-800">
        <AcademicCapIcon className="w-8 h-8 text-primary-500" />
        <span className="ml-2 text-white font-semibold">QuizBank</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-3">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
            alt={user?.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;