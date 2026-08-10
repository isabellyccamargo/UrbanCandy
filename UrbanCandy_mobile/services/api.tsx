import axios from 'axios';
export const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL!;

console.log('==========================');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('API URL:', `${API_BASE_URL}/api`);
console.log('==========================');

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common.Authorization =
            `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

export default api;