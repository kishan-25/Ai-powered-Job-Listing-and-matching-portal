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

// Create a new job
export const createJob = async (jobData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/recruiter/jobs`,
      jobData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create job' };
  }
};

// Get all jobs posted by recruiter
export const getRecruiterJobs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/recruiter/jobs?${queryParams}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch jobs' };
  }
};

// Get recruiter statistics
export const getRecruiterStats = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/recruiter/stats`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};

// Get job by ID
export const getJobById = async (jobId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/recruiter/jobs/${jobId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch job details' };
  }
};

// Update job
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/recruiter/jobs/${jobId}`,
      jobData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update job' };
  }
};

// Delete job
export const deleteJob = async (jobId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/v1/recruiter/jobs/${jobId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete job' };
  }
};

// Close job
export const closeJob = async (jobId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/recruiter/jobs/${jobId}/close`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to close job' };
  }
};

// Get applications for a job
export const getJobApplications = async (jobId, filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/recruiter/jobs/${jobId}/applications?${queryParams}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch applications' };
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status, notes = '') => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/v1/recruiter/applications/${applicationId}/status`,
      { status, notes },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update application status' };
  }
};
