import api from './api';

export async function getAllOffers(
    page = 1,
    size = 10
) {
    try {
        const response = await api.get('/oferta/listar', {
            params: {
                page,
                size,
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            'Erro ao buscar ofertas:',
            error
        );

        throw error;
    }
}