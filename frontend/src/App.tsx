import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import QuestionBank from './pages/QuestionBank'
import UploadDocx from './pages/UploadDocx'
import QuizGenerator from './pages/QuizGenerator'
import QuizTaker from './pages/QuizTaker'
import History from './pages/History'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/questions" element={<QuestionBank />} />
                <Route path="/upload" element={<UploadDocx />} />
                <Route path="/quiz/generate" element={<QuizGenerator />} />
                <Route path="/quiz/:quizId/take" element={<QuizTaker />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App