import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3000';
export const API_BASE_URL = BASE_URL;

const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

api.interceptors.request.use(
    async (config) => {
        try {
            // Busca o token em todas as chaves possíveis utilizadas no projeto
            const rawToken =
                (await AsyncStorage.getItem('@UrbanCandy:token')) ||
                (await AsyncStorage.getItem('user_token')) ||
                (await AsyncStorage.getItem('token'));

            if (rawToken) {
                // Limpa aspas extras que o JSON.stringify insere no AsyncStorage
                const token = rawToken.replace(/^"(.*)"$/, '$1').trim();
                
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                console.warn('[API Interceptor] Nenhum token encontrado no AsyncStorage!');
            }
        } catch (error) {
            console.error('[API Interceptor] Erro ao carregar token:', error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;