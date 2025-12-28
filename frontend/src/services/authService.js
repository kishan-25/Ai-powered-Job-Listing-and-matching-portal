"use client"
import axios from "axios";
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/v1/auth`;


// Add these functions to handle token storage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    
    // Store the token when login is successful
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      
      // Also store user data for persistent sessions
      localStorage.setItem('userData', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    
    // Store token and user data for new registrations too
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error("Register API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const logoutUser = () => {
  removeToken();
  localStorage.removeItem('userData');
};

// Add this function to match the import in Navbar.js
export const removeUserFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userData');
    removeToken();
  }
};