"use client"
import axios from "axios";
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/v1/jobs`;

export const fetchTelegramJobs = async () => {
    const response = await axios.get(`${API_URL}/telegram`);
    return response.data;
}

export const fetchTimesJobs = async () => {
    const response = await axios.get(`${API_URL}/times`);
    return response.data;
}