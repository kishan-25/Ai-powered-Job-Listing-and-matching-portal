// API Configuration
// Switch between development and production URLs

const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://talentalign-backend.onrender.com';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/v1/auth`,
  jobs: `${API_BASE_URL}/api/v1/jobs`,
  applications: `${API_BASE_URL}/api/v1/applications`,
  resume: `${API_BASE_URL}/api/v1/resume`,
  coverLetter: `${API_BASE_URL}/api/v1/cover-letter`,
  contact: `${API_BASE_URL}/api/v1/contact`,
  uploadCV: `${API_BASE_URL}/upload-cv`,
  processCV: `${API_BASE_URL}/process-cv`,
};

export default API_ENDPOINTS;
