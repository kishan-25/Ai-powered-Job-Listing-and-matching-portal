import axios from "axios";

// const API_URL = "http://localhost:5000/api/v1/cover-letter";
const API_URL = "https://talentalign-backend.onrender.com/api/v1/cover-letter";

export const generateCoverLetter = async (payload, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, payload, config);
    return response.data.coverLetter;
  } catch (error) {
    console.error("Cover letter generation error:", error.response?.data || error.message);
    
    // Provide more specific error messages based on the error response
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. Please check your permissions.");
    } else if (error.response?.status === 404) {
      throw new Error("Cover letter service not found. Please try again later.");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      throw new Error(error.response?.data?.message || "Failed to generate cover letter. Please try again.");
    }
  }
};