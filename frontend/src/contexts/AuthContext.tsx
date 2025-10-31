import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

interface User {
  id: number
  email: string
  name: string
  picture?: string
  is_admin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (idToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (idToken: string) => {
    try {
      const response = await axios.post('/api/auth/google', { id_token: idToken })
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      await fetchUser()
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }