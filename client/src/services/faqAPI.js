import axios from 'axios';

// Create axios instance for FAQ API
const faqAPI = axios.create({
  baseURL: 'http://localhost:5001/api/faqs',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies are sent with requests
});

// Request interceptor to add auth headers
faqAPI.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = user.role || 'admin';
    config.headers['x-user-type'] = userType;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
faqAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// FAQ API functions
export const faqService = {
  // Get all FAQs
  getAllFAQs: async (params = {}) => {
    try {
      const response = await faqAPI.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch FAQs' };
    }
  },

  // Get single FAQ
  getFAQ: async (id) => {
    try {
      const response = await faqAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch FAQ' };
    }
  },

  // Create new FAQ
  createFAQ: async (faqData) => {
    try {
      const response = await faqAPI.post('/', faqData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create FAQ' };
    }
  },

  // Update FAQ
  updateFAQ: async (id, faqData) => {
    try {
      const response = await faqAPI.put(`/${id}`, faqData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update FAQ' };
    }
  },

  // Delete FAQ
  deleteFAQ: async (id) => {
    try {
      const response = await faqAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete FAQ' };
    }
  },

  // Toggle FAQ status
  toggleFAQStatus: async (id) => {
    try {
      const response = await faqAPI.patch(`/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to toggle FAQ status' };
    }
  },

  // Get FAQ statistics
  getFAQStats: async () => {
    try {
      const response = await faqAPI.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch FAQ statistics' };
    }
  },

  // Search FAQs
  searchFAQs: async (searchTerm, filters = {}) => {
    try {
      const response = await faqAPI.get('/', {
        params: {
          search: searchTerm,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search FAQs' };
    }
  }
};

export default faqService;
