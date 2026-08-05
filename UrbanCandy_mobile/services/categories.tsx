import api from './api';

export async function getAllCategories(
    page = 1,
    size = 100
) {
    try {
        const response = await api.get('/categoria/listar', {
            params: {
                page,
                size,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
    }
}