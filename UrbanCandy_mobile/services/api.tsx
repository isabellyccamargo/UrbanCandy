import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Exportação explícita para evitar o valor 'undefined'
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3000';
export const API_BASE_URL = BASE_URL;

const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token =
      (await AsyncStorage.getItem('@UrbanCandy:token')) ||
      (await AsyncStorage.getItem('token'));

    if (token) {
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;