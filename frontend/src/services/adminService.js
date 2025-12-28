import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Get authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Get all users
export const getAllUsers = async (filters = {}) => {
  try {
    // Remove undefined values from filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    );

    const queryParams = new URLSearchParams(cleanFilters).toString();
    const url = `${API_BASE_URL}/api/v1/admin/users?${queryParams}`;
    console.log('Fetching users from:', url);
    console.log('Auth header:', getAuthHeader());

    const response = await axios.get(url, getAuthHeader());
    console.log('Users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error response:', error.response?.data);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/users/${userId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user details' };
  }
};

// Suspend user
export const suspendUser = async (userId, reason) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/admin/users/${userId}/suspend`,
      { reason },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to suspend user' };
  }
};

// Activate user
export const activateUser = async (userId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/admin/users/${userId}/activate`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to activate user' };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/admin/users/${userId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

// Update user role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/admin/users/${userId}/role`,
      { role },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user role' };
  }
};

// Get system analytics
export const getSystemAnalytics = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/analytics`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch analytics' };
  }
};

// Get all jobs
export const getAllJobs = async (filters = {}) => {
  try {
    // Remove undefined values from filters
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    );

    const queryParams = new URLSearchParams(cleanFilters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/jobs?${queryParams}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch jobs' };
  }
};

// Get all applications
export const getAllApplications = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/admin/applications?${queryParams}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch applications' };
  }
};

// Close any job
export const closeAnyJob = async (jobId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/admin/jobs/${jobId}/close`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to close job' };
  }
};
