import api from './api';

export async function loginUser(email: string, password: string) {
    try {
        const response = await api.post('/login', {
            email,
            password,
        });

        return response.data;
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message ||
            'Erro ao realizar login.'
        );
    }
}