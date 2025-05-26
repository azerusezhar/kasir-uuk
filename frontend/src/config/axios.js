import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


axiosInstance.interceptors.request.use(
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        response: {
          status: 0,
          data: {
            message: 'Network error. Please check your connection and try again.'
          }
        }
      });
    }

    // Handle unauthorized access (401)
    if (error.response.status === 401) {
      localStorage.removeItem('token');
    }
    
    // Handle forbidden access (403)
    if (error.response.status === 403) {
      console.error('Forbidden access:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 