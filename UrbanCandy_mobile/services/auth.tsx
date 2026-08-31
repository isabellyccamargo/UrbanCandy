import api from './api';
import { saveTokens, saveUser } from './authStorage';

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
            complement?: string;
        };
    };

    address?: {
        id_address?: number;
        cep?: string;
        city?: string;
        neighborhood?: string;
        road?: string;
        number?: string | number;
        complement?: string;
    };
};

export type CreateUserData = {
    email: string;
    password: string;
    name: string;
    cpf: string;
    telephone: string;
    cep: string;
    city: string;
    neighborhood: string;
    road: string;
    number: number;
    complement: string;
};

export async function loginUser(
    email: string,
    password: string
) {
    try {
        const response = await api.post('/login', {
            email,
            password,
        });

        const data = response.data;

        await saveTokens(
            data.accessToken,
            data.refreshToken
        );

        await saveUser(data.user);

        return data;
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

export async function getUserProfile(
    id_user: number
): Promise<UserProfile> {
    const response = await api.get(
        `/usuario/listarPorId/${id_user}`
    );

    return response.data;
}

export async function createUser(
    userData: CreateUserData
) {
    const response = await api.post(
        '/usuario/salvar',
        userData
    );

    return response.data;
}

export async function updateUser(
    id_user: number,
    userData: {
        password?: string;
    },
    personData: {
        id_people?: number;
        name?: string;
        telephone?: string;
    }
) {
    const response = await api.put(
        `/usuario/atualizar/${id_user}`,
        {
            userData,
            personData,
        }
    );

    return response.data;
}