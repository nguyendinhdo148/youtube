import axios from "axios";

let base = import.meta.env.VITE_API_BASE_URL || "";
// remove trailing slash if present
base = base.replace(/\/+$/, "");
// ensure /api prefix exists
const BASE_URL = base.endsWith("/api") ? base : `${base}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
