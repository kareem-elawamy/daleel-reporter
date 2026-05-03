import axios, { InternalAxiosRequestConfig } from "axios";
import { TokenResponse } from "@/types/api";

// Using Vite's import.meta.env for the API Base URL
// Provide a sensible fallback for local development if the env var is missing
const isProd = import.meta.env.PROD;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isProd ? "https://daleel-reporter.runasp.net" : "https://localhost:7198");

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Queue for holding failed requests while a token refresh is in progress
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach the access token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ensure we are in a browser environment (important for SSR in TanStack Start)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Extended config to track retries
interface RetryQueueRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 2 & 3. Response Interceptor & Refresh Logic
axiosClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config as RetryQueueRequest;

    // Check if error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // If a refresh is already in progress, put the request into a queue
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if ((originalRequest as any).headers) {
              (originalRequest as any).headers["Authorization"] = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark the request as retried and set refreshing state
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      const isAuthEndpoint = originalRequest.url?.includes("/auth/me") || originalRequest.url?.includes("/auth/login");

      // If there's no refresh token to begin with, kick them out
      if (!refreshToken) {
        isRefreshing = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (!isAuthEndpoint && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }

      try {
        // Use a generic axios instance (not axiosClient) to avoid interceptor loops
        const { data } = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Process the queue with the new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        if ((originalRequest as any).headers) {
          (originalRequest as any).headers["Authorization"] = `Bearer ${newAccessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed or expired
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (!isAuthEndpoint && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Return other errors immediately
    return Promise.reject(error);
  }
);
