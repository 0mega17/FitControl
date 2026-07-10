import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    setAuthToken(token)
    try {
      const { data } = await api.get('/auth/perfil')
      setUser(data)
    } catch {
      setAuthToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAuthToken(data.token)
    setUser(data.usuario)
    return data
  }

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    setAuthToken(data.token)
    setUser(data.usuario)
    return data
  }

  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
