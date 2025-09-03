import axios from './axios.customize';
const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = {
        name, email, password
    }
    return axios.post(URL_API, data)
}
const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = {
        email, password
    }
    return axios.post(URL_API, data)
}
const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API)
}
export const callFetchUsers = (page = 1, limit = 5) => {
    let url = '/v1/api/users';
    const params = new URLSearchParams();
    
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
    return axios.get(url);
};
export {
    createUserApi, loginApi, getUserApi,
}