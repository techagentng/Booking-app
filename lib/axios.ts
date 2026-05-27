import axios from 'axios';
import { getSession, clearSession } from '../utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CORS mode for development
if (process.env.NODE_ENV === 'development') {
  axiosInstance.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
}

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session) {
        config.headers.Authorization = `Bearer ${session}`;
      }
    } catch (error) {
      console.log('No session available:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Pages that should not redirect to login on 401
const noAuthRedirectPages = ['/inroomtablet', '/bookings', '/bookings/new', '/login', '/signup'];

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend may be down');
    } else if (error.response?.status === 401) {
      // Handle 401 Unauthorized errors
      console.error('Unauthorized request - redirecting to login');
      
      // Clear session and redirect, but skip for certain pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const shouldSkipRedirect = noAuthRedirectPages.some(page => currentPath.startsWith(page));
        
        if (!shouldSkipRedirect) {
          clearSession();
          
          // Redirect to login page with return URL
          const returnUrl = encodeURIComponent(currentPath);
          window.location.href = `/login?redirectTo=${returnUrl}`;
        }
      }
    } else if (error.response?.status === 403) {
      console.error('Forbidden - insufficient permissions');
    } else if (error.response?.status === 500) {
      console.error('Server error - backend may be down');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
