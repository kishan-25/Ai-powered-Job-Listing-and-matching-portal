import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const judge0Client = axios.create({
  baseURL: process.env.JUDGE0_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    "X-RapidAPI-Host": process.env.RAPID_API_HOST,
  },
});

export default judge0Client;
