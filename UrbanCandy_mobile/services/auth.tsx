import api from './api';

export type UserProfile = {
    id_user?: number;
    id_people?: number;
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
    telephone?: string;
};

export type CreateUserData = {
    name: string;
    email: string;  
    password?: string;
    cpf: string;
    telephone: string;
    cep: string;
    city: string;
    neighborhood: string;
    road: string;
    number: number;
    complement?: string;
};

export async function loginUser(
    email: string,
    password: string
) {
    console.log('[AUTH.TSX] Iniciando loginUser para o e-mail:', email);

    try {
        const response = await api.post('/login', {
            email,
            password,
        });

        console.log('[AUTH.TSX] Resposta recebida com sucesso:', response.status);
        return response.data;
    } catch (error: any) {
        console.log('--------------------------------------------------');
        console.log('[AUTH.TSX ERRO DETALHADO]');
        console.log('Tem resposta do servidor? (error.response):', !!error.response);

        if (error.response) {
            console.log('Status HTTP:', error.response.status);
            console.log('Corpo da resposta:', error.response.data);
        } else if (error.request) {
            console.log('A requisição saiu, mas não obteve resposta do servidor.');
        } else {
            console.log('Erro de configuração do Axios/JS:', error.message);
        }
        console.log('--------------------------------------------------');

        const data = error.response?.data || {};
        const message =
            data.message ||
            data.mensagem ||
            (error.response ? `Servidor respondeu com código ${error.response.status}` : 'Falha na conexão física com a API');

        throw new Error(message);
    }
}

export async function getUserProfile(id_user: number) {
    try {
        const response = await api.get(`/usuario/listarPorId/${id_user}`);
        const data = response.data;
        
        return data?.data || data;
    } catch (error: any) {
        console.log('[AUTH.TSX] Erro ao buscar perfil:', error?.response?.status || error.message);
        throw error;
    }
}

/**
 * Cria um novo usuário na API
 */
export async function createUser(userData: CreateUserData) {
    try {
        const response = await api.post('/usuario/criar', userData);
        return response.data;
    } catch (error: any) {
        console.log('[AUTH.TSX] Erro no createUser:', error?.response?.data || error.message);
        throw error;
    }
}

/**
 * Atualiza os dados de um usuário existente na API
 */
export async function updateUser(
    id_user: number,
    userData: Partial<UserProfile> = {},
    peopleData: Record<string, any> = {}
) {
    try {
        const payload = {
            ...userData,
            ...peopleData,
        };

        const response = await api.put(`/usuario/atualizar/${id_user}`, payload);
        return response.data;
    } catch (error: any) {
        console.log('[AUTH.TSX] Erro no updateUser:', error?.response?.data || error.message);
        throw error;
    }
}