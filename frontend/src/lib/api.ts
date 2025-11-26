import axios from 'axios';
import { serverURL } from '@/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: serverURL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to store auth data
export const setAuthData = (data: { token: string; userData: { _id: string; email: string; mName: string; type: string } }) => {
  sessionStorage.setItem('token', data.token);
  sessionStorage.setItem('email', data.userData.email);
  sessionStorage.setItem('mName', data.userData.mName);
  sessionStorage.setItem('auth', 'true');
  sessionStorage.setItem('uid', data.userData._id);
  sessionStorage.setItem('type', data.userData.type);
};

// Helper to clear auth data
export const clearAuthData = () => {
  sessionStorage.clear();
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return !!sessionStorage.getItem('token') && !!sessionStorage.getItem('auth');
};

// Helper to get current user info
export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  return {
    id: sessionStorage.getItem('uid'),
    email: sessionStorage.getItem('email'),
    name: sessionStorage.getItem('mName'),
    type: sessionStorage.getItem('type'),
  };
};
