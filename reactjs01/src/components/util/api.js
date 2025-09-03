import axios from './axios.customize';

// Auth APIs
export const registerAPI = (userData) => {
    return axios.post('/auth/register', userData);
};

export const loginAPI = (credentials) => {
    return axios.post('/auth/login', credentials);
};

export const logoutAPI = () => {
    return axios.post('/auth/logout');
};

export const getProfileAPI = () => {
    return axios.get('/auth/profile');
};

export const changePasswordAPI = (passwordData) => {
    return axios.put('/auth/change-password', passwordData);
};

export const refreshTokenAPI = (refreshToken) => {
    return axios.post('/auth/refresh-token', { refreshToken });
};

// User Management APIs
export const getAllUsersAPI = (params = {}) => {
    const { page, limit } = params;
    let url = '/users';
    
    if (page || limit) {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        url += `?${queryParams.toString()}`;
    }
    
    return axios.get(url);
};

export const getUserByIdAPI = (id) => {
    return axios.get(`/users/${id}`);
};

export const createUserAPI = (userData) => {
    return axios.post('/users', userData);
};

export const updateUserAPI = (id, userData) => {
    return axios.put(`/users/${id}`, userData);
};

export const deleteUserAPI = (id) => {
    return axios.delete(`/users/${id}`);
};