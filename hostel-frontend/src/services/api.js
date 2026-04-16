import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// named helper (optional)
export const loginUser = (email, password) => {
  return api.post("/login", { email, password });
};

export default api;

