"use client";

import axios from "axios";
import { getToken } from "./authService";

// const API_URL = "http://localhost:5000/api/v1/applications";
const API_URL = "https://talentalign-backend.onrender.com/api/v1/applications";

export const trackJobApplication = async (jobData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, jobData, config);
    return response.data;
  } catch (error) {
    console.error("Application tracking error:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserApplications = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    console.error("Get applications error:", error.response?.data || error.message);
    
    // Provide more specific error messages based on the error response
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error("Access denied. Please check your permissions.");
    } else if (error.response?.status === 404) {
      throw new Error("No applications found.");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      throw new Error(error.response?.data?.message || "Failed to load applications. Please try again.");
    }
  }
};