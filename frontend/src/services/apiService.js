import api from '../api/axios';

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
        };
    }
};
