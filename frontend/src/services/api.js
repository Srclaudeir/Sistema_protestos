// src/services/api.js
import axios from "axios";

const resolveDefaultApiUrl = () => {
  if (typeof window !== "undefined" && window.location?.hostname) {
    const protocol = window.location.protocol.startsWith("https")
      ? "https"
      : "http";
    return `${protocol}://${window.location.hostname}:3000/api/v1`;
  }
  return "http://localhost:3000/api/v1";
};

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? resolveDefaultApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Dashboard API calls
export const dashboardAPI = {
  getSummary: () => api.get("/dashboard/summary"),
  getDetailedStats: () => api.get("/dashboard/stats"),
};

// Authentication API calls
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
};

// Clientes API calls
export const clientesAPI = {
  getAll: (params) => api.get("/clientes", { params }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (clienteData) => api.post("/clientes", clienteData),
  update: (id, clienteData) => api.put(`/clientes/${id}`, clienteData),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// Contratos API calls
export const contratosAPI = {
  getAll: (params) => api.get("/contratos", { params }),
  getById: (id) => api.get(`/contratos/${id}`),
  create: (contratoData) => api.post("/contratos", contratoData),
  update: (id, contratoData) => api.put(`/contratos/${id}`, contratoData),
  delete: (id) => api.delete(`/contratos/${id}`),
};

// Protestos API calls
export const protestosAPI = {
  getAll: (params) => api.get("/protestos", { params }),
  getById: (id) => api.get(`/protestos/${id}`),
  create: (protestoData) => api.post("/protestos", protestoData),
  update: (id, protestoData) => api.put(`/protestos/${id}`, protestoData),
  delete: (id) => api.delete(`/protestos/${id}`),
  export: (params) =>
    api.get("/protestos/export", {
      params,
      responseType: "blob",
    }),
};

// Avalistas API calls
export const avalistasAPI = {
  getAll: (params) => api.get("/avalistas", { params }),
  getById: (id) => api.get(`/avalistas/${id}`),
  create: (avalistaData) => api.post("/avalistas", avalistaData),
  update: (id, avalistaData) => api.put(`/avalistas/${id}`, avalistaData),
  delete: (id) => api.delete(`/avalistas/${id}`),
};

// Especies API calls
export const especiesAPI = {
  getAll: (params) => api.get("/especies", { params }),
  getById: (id) => api.get(`/especies/${id}`),
  create: (especieData) => api.post("/especies", especieData),
  update: (id, especieData) => api.put(`/especies/${id}`, especieData),
  delete: (id) => api.delete(`/especies/${id}`),
};
