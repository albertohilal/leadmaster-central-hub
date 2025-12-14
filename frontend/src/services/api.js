import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor para agregar token JWT a todas las peticiones
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores global
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    // Si es 401, redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== SESSION MANAGER API =====
export const sessionAPI = {
  getStatus: () => api.get('/session-manager/status'),
  getState: () => api.get('/session-manager/state'),
  getQR: () => api.get('/session-manager/qr'),
  connect: () => api.post('/session-manager/login'),
  disconnect: () => api.post('/session-manager/logout'),
  getLogs: () => api.get('/session-manager/logs'),
};

// ===== LISTENER API =====
export const listenerAPI = {
  getStatus: () => api.get('/listener/status'),
  setMode: (mode) => api.post('/listener/mode', { mode }),
  getLogs: (params) => api.get('/listener/logs', { params }),
  enableIA: (telefono) => api.post('/listener/ia/enable', { telefono }),
  disableIA: (telefono) => api.post('/listener/ia/disable', { telefono }),
  getIAStatus: (telefono) => api.get(`/listener/ia/status/${telefono}`),
  testMessage: (data) => api.post('/listener/test-message', data),
};

// ===== SENDER API =====
export const senderAPI = {
  sendMessage: (data) => api.post('/sender/messages/send', data),
  sendBulk: (data) => api.post('/sender/messages/bulk', data),
  getMessageStatus: (id) => api.get(`/sender/messages/status/${id}`),
  // Programaciones
  listProgramaciones: (params) => api.get('/sender/programaciones', { params }),
  createProgramacion: (data) => api.post('/sender/programaciones', data),
  getCampaigns: () => api.get('/sender/campaigns'),
  createCampaign: (data) => api.post('/sender/campaigns', data),
  getCampaignStats: (id) => api.get(`/sender/campaigns/${id}/stats`),
};

// ===== LEADS API (por implementar en backend) =====
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  search: (query) => api.get('/leads/search', { params: { q: query } }),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  getConversations: (id) => api.get(`/leads/${id}/conversations`),
};

// ===== STATS API (agregado para dashboard) =====
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getSystemHealth: () => api.get('/stats/health'),
};

export default api;
