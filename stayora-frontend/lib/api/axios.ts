import axios from "axios";
import { getAuthToken } from "../cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

// Read CSRF token from cookie (client-side only)
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// Read CSRF token from Next.js request cookies (server-side only, e.g. within
// server actions / route handlers). This reads the incoming request's cookies
// which include the csrf_token cookie that the backend set on the client.
async function getCsrfTokenFromServerCookies(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
  } catch {
    // Not in a Next.js request context (e.g. build time, test environment)
    return null;
  }
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach auth + CSRF tokens to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    // Auth token
    const token = await getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // CSRF token (mutating requests only)
    const method = (config.method || "get").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      // Try client-side first (document.cookie in browser)
      let csrfToken = getCsrfTokenFromCookie();

      // Fallback to server-side (Next.js request cookies in server actions)
      if (!csrfToken) {
        csrfToken = await getCsrfTokenFromServerCookies();
      }

      if (csrfToken) {
        config.headers[CSRF_HEADER_NAME] = csrfToken;

        // When running server-side (Next.js server action), the outgoing
        // HTTP request to the backend doesn't carry the client's browser
        // cookies automatically. The backend's double-submit CSRF pattern
        // checks BOTH the csrf_token cookie AND the x-csrf-token header,
        // so we must manually forward the cookie too.
        if (typeof document === "undefined") {
          const existingCookie = config.headers["Cookie"] || "";
          config.headers["Cookie"] = existingCookie
            ? `${existingCookie}; ${CSRF_COOKIE_NAME}=${csrfToken}`
            : `${CSRF_COOKIE_NAME}=${csrfToken}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
