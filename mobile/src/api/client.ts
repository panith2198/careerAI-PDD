import axios from 'axios';

import { useAuthStore } from '../store/authStore';

const defaultBaseUrl = 'https://careerai-api.welcos.in/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || defaultBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token?: string) {
  failedQueue.forEach((request) => {
    if (error || !token) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken || useAuthStore.getState().token;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const nextToken = refreshResponse.data.access_token;

        useAuthStore.getState().setToken(nextToken, refreshToken);
        processQueue(null, nextToken);
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.detail || error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  },
);
