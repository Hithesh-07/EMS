import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Replace with environment variable in production
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to attach JWT token
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

// Response interceptor for handling common errors automatically
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthenticated: clear token and optionally redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
