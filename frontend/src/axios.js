import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000", // fallback to 4000
  headers: {
    "Content-Type": "application/json"
},
  withCredentials: true, // if you're using cookies for auth
});

export default API;
