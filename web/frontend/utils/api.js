import axios from 'axios';
import { getCurrentStoreDomain } from './storeUtils';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be prefixed to all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with cross-site requests
});

// Request interceptor to add auth token if it exists and store domain
api.interceptors.request.use(
  (config) => {
    // Get the current store domain
    const storeDomain = getCurrentStoreDomain();
    
    // Add store domain to the request data
    if (config.data) {
      if (typeof config.data === 'object') {
        config.data.store_domain = storeDomain;
      } else if (typeof config.data === 'string') {
        try {
          const parsedData = JSON.parse(config.data);
          parsedData.store_domain = storeDomain;
          config.data = JSON.stringify(parsedData);
        } catch (error) {
          // If it's not JSON, create a new data object
          config.data = { 
            original_data: config.data,
            store_domain: storeDomain 
          };
        }
      }
    } else {
      // If no data, create data with store domain
      config.data = { store_domain: storeDomain };
    }
    
    // You can add auth token here if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 404, 500, etc.)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        console.error('Unauthorized access - please login');
      } else if (error.response.status === 403) {
        // Handle forbidden
        console.error('You do not have permission to access this resource');
      } else if (error.response.status === 404) {
        // Handle not found
        console.error('The requested resource was not found');
      } else if (error.response.status >= 500) {
        // Handle server errors
        console.error('A server error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;
