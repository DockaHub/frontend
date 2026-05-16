import axios, { AxiosError } from 'axios';

export const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.');
    return isLocal ? 'http://localhost:3001/api' : 'https://backend-production-0647.up.railway.app/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Strips /api from the base URL to get the backend root (useful for static file access like /uploads)
 */
export const getBackendUrl = () => {
    return API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '');
};

// Create axios instance with default config
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to all requests
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

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Não redirecionar para /login se estivermos no portal do cliente ou página de assinatura
            const isPublicPath = window.location.pathname.startsWith('/portal') || window.location.pathname.startsWith('/sign');
            if (!isPublicPath) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
