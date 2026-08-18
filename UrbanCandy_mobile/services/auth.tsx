import api from './api';

export type UserProfile = {
    id_user?: number;
    id_people?: number;
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
    telephone?: string;
    people?: {
        id_people?: number;
        name?: string;
        cpf?: string;
        telephone?: string;
        phone?: string;
        address?: {
            id_address?: number;
            cep?: string;
            city?: string;
            neighborhood?: string;
            road?: string;
            number?: string | number;
        };
    };
    address?: {
        id_address?: number;
        cep?: string;
        city?: string;
        neighborhood?: string;
        road?: string;
        number?: string | number;
    };
};

export async function loginUser(email: string, password: string) {
    try {
        const response = await api.post('/login', { email, password });
        return response.data;
    } catch (error: any) {
        const data = error.response?.data || {};
        const err = new Error(
            data.message ||
            data.mensagem ||
            'Erro ao conectar ao servidor'
        );
        (err as any).response = error.response;
        throw err;
    }
}

export async function getUserProfile(id_user: number): Promise<UserProfile> {
    const response = await api.get(`/usuario/listarPorId/${id_user}`);
    return response.data;
}