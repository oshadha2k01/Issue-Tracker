import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API calls
export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },
};

// Issues API calls
export const issuesAPI = {
  // Get all issues
  getAllIssues: async () => {
    try {
      const response = await api.get('/issues');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch issues' };
    }
  },

  // Get issue by ID
  getIssueById: async (id) => {
    try {
      const response = await api.get(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch issue' };
    }
  },

  // Create new issue
  createIssue: async (issueData) => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create issue' };
    }
  },

  // Update issue
  updateIssue: async (id, issueData) => {
    try {
      const response = await api.put(`/issues/${id}`, issueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update issue' };
    }
  },

  // Delete issue
  deleteIssue: async (id) => {
    try {
      const response = await api.delete(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete issue' };
    }
  },
};

export default api;
