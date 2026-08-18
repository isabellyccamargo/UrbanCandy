import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('@UrbanCandy:token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

export function getApiErrorMessage(
    error: any,
    fallback = 'Ocorreu um erro. Tente novamente.'
) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.message ||
        fallback
    );
}

export default api;