import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.response?.status >= 400) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// URL API functions
export const urlAPI = {
  // Shorten URL
  shortenUrl: (data) => api.post('/urls/shorten', data),
  
  // Get user URLs
  getUserUrls: (params = {}) => api.get('/urls', { params }),
  
  // Get URL by ID
  getUrlById: (id) => api.get(`/urls/${id}`),
  
  // Delete URL
  deleteUrl: (id) => api.delete(`/urls/${id}`),
  
  // Get URL analytics
  getUrlAnalytics: (id) => api.get(`/urls/${id}/analytics`),
}

// Auth API functions
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
}