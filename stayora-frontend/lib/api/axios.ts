import axios from "axios";
import { getAuthToken } from "../cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies (including httpOnly auth_token) with cross-origin requests
});

// On every request, attach the Bearer token as a fallback.
// The httpOnly cookie (set by the backend) is preferred, but when the
// cookie isn't available (e.g. server-side rendering / edge middleware)
// the Authorization header provides the token.
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
