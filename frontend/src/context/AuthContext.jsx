import { createContext, useContext, useReducer, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    loading: true
  })

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/profile')
          dispatch({ type: 'SET_USER', payload: response.data.user })
          dispatch({ type: 'SET_TOKEN', payload: token })
        } catch (error) {
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      dispatch({ type: 'SET_USER', payload: user })
      dispatch({ type: 'SET_TOKEN', payload: token })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      dispatch({ type: 'SET_USER', payload: user })
      dispatch({ type: 'SET_TOKEN', payload: token })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}