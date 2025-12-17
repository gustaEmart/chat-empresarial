import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getCurrentUser: () => 
    api.get('/auth/me')
};

// Users
export const usersAPI = {
  getAll: () => 
    api.get('/users'),
  
  getById: (id) => 
    api.get(`/users/${id}`),
  
  search: (query) => 
    api.get(`/users/search?q=${encodeURIComponent(query)}`)
};

// Groups
export const groupsAPI = {
  getAll: () => 
    api.get('/groups'),
  
  create: (groupData) => 
    api.post('/groups', groupData),
  
  update: (id, groupData) => 
    api.put(`/groups/${id}`, groupData),
  
  delete: (id) => 
    api.delete(`/groups/${id}`),
  
  addMember: (groupId, userId) => 
    api.post(`/groups/${groupId}/members`, { userId }),
  
  removeMember: (groupId, userId) => 
    api.delete(`/groups/${groupId}/members/${userId}`)
};

// Messages
export const messagesAPI = {
  getByConversation: (conversationId, params = {}) => 
    api.get(`/messages/${conversationId}`, { params }),
  
  send: (messageData) => 
    api.post('/messages', messageData),
  
  markAsRead: (messageId) => 
    api.put(`/messages/${messageId}/read`),
  
  markConversationAsRead: (conversationId) => 
    api.put(`/messages/conversation/${conversationId}/read`)
};

export default api;
