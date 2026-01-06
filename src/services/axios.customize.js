import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // withCredentials: true, // không cần nếu dùng Bearer token
});

// ================= REQUEST INTERCEPTOR =================
// Nếu config có `skipAuth: true` → không gắn token
instance.interceptors.request.use(
  function (config) {
    if (!config.skipAuth) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// ================= RESPONSE INTERCEPTOR =================
instance.interceptors.response.use(
  function (response) {
    if (response && response.data) return response.data;
    return response;
  },
  function (error) {
    if (error && error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;
