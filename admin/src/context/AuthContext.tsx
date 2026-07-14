import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

interface User {
  id: string
  fullName: string
  phone: string
  email?: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const response = await api.get('/auth/profile')
      const profile = response.data
      if (profile.role === 'ADMIN' || profile.role === 'STAFF') {
        setUser(profile)
      } else {
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to validate token:', err)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const login = async (token: string) => {
    localStorage.setItem('token', token)
    setLoading(true)
    await fetchProfile()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
