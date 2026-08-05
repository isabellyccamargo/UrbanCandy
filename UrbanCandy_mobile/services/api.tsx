import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://192.168.0.181:3000/api',
    baseURL: 'http://10.10.102.33:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

export default api;