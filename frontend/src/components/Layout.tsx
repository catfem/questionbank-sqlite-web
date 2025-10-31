import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  QuestionMarkCircleIcon,
  DocumentArrowUpIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Question Bank', href: '/questions', icon: QuestionMarkCircleIcon },
    { name: 'Upload DOCX', href: '/upload', icon: DocumentArrowUpIcon },
    { name: 'Generate Quiz', href: '/quiz/generate', icon: AcademicCapIcon },
    { name: 'History', href: '/history', icon: ClockIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Quiz System</h1>
          </div>
          
          <nav className="mt-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.picture || 'https://via.placeholder.com/32'}
                alt={user?.name}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </header>
          
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout