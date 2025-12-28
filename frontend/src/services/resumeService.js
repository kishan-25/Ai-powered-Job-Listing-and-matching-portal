"use client";
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload-cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });

    return response.data;
  } catch (error) {
    console.error("Resume upload error:", error.response?.data || error.message);
    throw error;
  }
};

export const parseResumeWithUrl = async (fileUrl) => {
  try {
    const response = await axios.post(`${API_URL}/process-cv`, { fileUrl });
    return response.data;
  } catch (error) {
    console.error("Resume parsing error:", error.response?.data || error.message);
    throw error;
  }
};

export const parseResume = async (file) => {
  try {
    // First upload the file
    const uploadResult = await uploadResume(file);
    
    if (!uploadResult.success || !uploadResult.fileUrl) {
      throw new Error("Failed to upload resume");
    }
    
    // Then process the CV
    return await parseResumeWithUrl(uploadResult.fileUrl);
  } catch (error) {
    console.error("Resume processing error:", error);
    throw error;
  }
};