// API Configuration — reads from NEXT_PUBLIC_API_URL env var.
// Set it in .env.local for local dev, or in the hosting platform for production.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://talentalign-backend.onrender.com'
    : 'http://localhost:5000');

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
