// src/utils/api.js
import axios from 'axios';

// Determine API base URL based on environment and custom configuration
const API_BASE_URL = (() => {
  // Allow explicit API URL override via environment variable
  if (process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }

  // In production, use relative API path (works with same domain deployment)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }

  // In development, use localhost backend
  return 'http://localhost:5000/api';
})();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session handling
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // For session-based auth, we don't need to add a token
    // The session will be handled via cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorStatus = error.response?.status;
    const currentPath = window.location.pathname;
    const isOnLoginPage = currentPath === '/login';

    if (errorStatus === 401) {
      // Log detailed information for debugging
      console.log('401 Error Details:', {
        status: errorStatus,
        currentPath,
        isOnLoginPage,
        errorData: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });

      // Don't redirect if we're already on login page
      if (!isOnLoginPage) {
        // Only redirect if it's a critical request (not auth check)
        const url = error.config?.url || '';
        if (!url.includes('/auth')) {
          console.log('Redirecting to login due to 401 error');
          window.location.href = '/login';
        } else {
          console.log('401 error on auth endpoint, staying on current page');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
