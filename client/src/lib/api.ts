
import axios from 'axios';

// Create base API client
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Wrapper function for API requests
export const apiRequest = async (endpoint: string, options?: any) => {
  try {
    const response = await api(endpoint, options);
    return response.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export default api;
