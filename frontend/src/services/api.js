import axios from 'axios';

// Get base URL depending on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/sessions
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if token expired / unauthorized
    if (error.response && error.response.status === 401) {
      // Don't auto-logout on failed login attempts
      if (!error.config.url.includes('/auth/login')) {
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         window.location.href = '/login';
      }
    }
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    return Promise.reject(error);
  }
);

export default api;
