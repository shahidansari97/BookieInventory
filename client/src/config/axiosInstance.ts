import axios from 'axios';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:9000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    
    // Handle different HTTP status codes
    switch (status) {
      case 400:
        error.message = data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        error.message = data?.message || 'Unauthorized. Please login again.';
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        // Don't redirect on login page to avoid infinite loop
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
      case 403:
        error.message = data?.message || 'Forbidden. You do not have permission to access this resource.';
        break;
      case 404:
        error.message = data?.message || 'Resource not found.';
        break;
      case 422:
        error.message = data?.message || 'Validation error. Please check your input.';
        break;
      case 429:
        error.message = data?.message || 'Too many requests. Please try again later.';
        break;
      case 500:
        error.message = data?.message || 'Internal server error. Please try again later.';
        break;
      case 502:
        error.message = 'Bad gateway. The server is temporarily unavailable.';
        break;
      case 503:
        error.message = 'Service unavailable. Please try again later.';
        break;
      case 504:
        error.message = 'Gateway timeout. The request took too long to process.';
        break;
      default:
        error.message = data?.message || `Request failed with status ${status}`;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
