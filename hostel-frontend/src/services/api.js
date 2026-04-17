import axios from "axios";

// Automatically switch to production backend when deployed
export const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://hostel-management-system-production-3673.up.railway.app" 
  : (process.env.REACT_APP_API_URL || "http://localhost:5000");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// named helper (optional)
export const loginUser = (email, password) => {
  return api.post("/login", { email, password });
};

export default api;

