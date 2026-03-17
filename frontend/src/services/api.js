import axios from 'axios';

// Get base URL depending on environment
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Self-healing: Ensure the URL ends with /api to avoid 404s in production
if (import.meta.env.VITE_API_URL && !API_URL.endsWith('/api')) {
  API_URL = `${API_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request Interceptor: Attach Token & Ensure path casing
api.interceptors.request.use(
  (config) => {
    // Robustness: Lowercase the URL path to avoid 404s due to casing (e.g. /Login -> /login)
    if (config.url) {
      const [path, query] = config.url.split('?');
      config.url = path.toLowerCase() + (query ? `?${query}` : '');
    }

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
