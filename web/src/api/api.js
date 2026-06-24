import axios from 'axios';
import useAuthStore from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token dynamically from authStore
instance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failures and 401 token refresh globally
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => {
    // Return data directly to match old fetch wrapper interface and keep compatibility
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and request has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentRefreshToken = useAuthStore.getState().refreshToken || useAuthStore.getState().token;
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }

        // Run direct axios call to avoid interceptor recursion
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: currentRefreshToken,
        });

        const newAccessToken = refreshResponse.data.access_token;
        useAuthStore.getState().setToken(newAccessToken, currentRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        isRefreshing = false;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear session and redirect on refresh failure
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Standardize error message throwing
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = instance;
export default instance;
