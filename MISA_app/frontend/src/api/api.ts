import axios from "axios";

// ✅ Use import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// import axios from "axios";

// // ✅ Set the base API URL from environment variables
// // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
// const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL as string) || "http://localhost:5001";

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });