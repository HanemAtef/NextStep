import axios from 'axios';

// Base API URL
const BASE_URL = 'https://nextstep.runasp.net/api';

// CORS proxy URL for development
const CORS_PROXY = 'https://thingproxy.freeboard.io/fetch/';

// Create axios instance with default configuration
const api = axios.create({

    baseURL: process.env.NODE_ENV === 'development'
        ? `${CORS_PROXY}${BASE_URL}`
        : BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to include token for authorized requests
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API methods
export const apiService = {
    // Auth endpoints
    login: (email, password) => api.post('/Auth/login', { email, password }),

    // Application types
    getApplicationTypes: () => api.get('/ApplicationTypes'),

    // Requests
    getInboxRequests: () => api.get('/Requests/inbox'),
    getOutboxRequests: () => api.get('/Requests/outbox'),
    getRequestById: (id) => api.get(`/Requests/${id}`),
    createRequest: (data) => api.post('/Requests', data),

    // Users
    getUserInfo: () => api.get('/Users/me'),
    getUsers: () => api.get('/Users'),
    createUser: (data) => api.post('/Users', data),
    updateUser: (id, data) => api.put(`/Users/${id}`, data),
    deleteUser: (id) => api.delete(`/Users/${id}`),

    // Departments
    getDepartments: () => api.get('/Departments'),
    createDepartment: (data) => api.post('/Departments', data),
    updateDepartment: (id, data) => api.put(`/Departments/${id}`, data),
    deleteDepartment: (id) => api.delete(`/Departments/${id}`),
};

export default apiService; 