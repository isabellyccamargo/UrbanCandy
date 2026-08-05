import api, { setAuthToken } from './api';

export interface LoginResponse {
    token?: string;
    accessToken?: string;
    [key: string]: any;
}

export async function loginUser(
    email: string,
    password: string
) {
    try {
        setAuthToken(null);

        const response = await api.post('/login', {
            email,
            password,
        });

        return response.data;

    } catch (error: any) {
        console.log('Status:', error.response?.status);
        console.log('Dados:', error.response?.data);

        throw new Error(
            error.response?.data?.message ||
            'Erro ao realizar login.'
        );
    }
}