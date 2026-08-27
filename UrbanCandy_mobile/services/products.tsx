import api from './api';

export async function getAllProducts(
    page = 1,
    size = 6
) {
    try {
        const response = await api.get('/produto/listar', {
            params: {
                page,
                size,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
}

export async function getFeaturedProducts(
    page = 1,
    size = 6
) {
    try {
        const response = await api.get('/produto/listar', {
            params: {
                page,
                size,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
        throw error;
    }
}

export async function getProductsByCategory(
    categoryName: string,
    page = 1,
    size = 50
) {
    try {
        const response = await api.get(
            `/produto/categoria/${categoryName}`,
            {
                params: {
                    page,
                    size,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            `Erro ao buscar produtos da categoria ${categoryName}:`,
            error
        );

        throw error;
    }
}

/**
 * Busca um produto específico pelo ID
 */
export async function getProductById(
    id_product: number
) {
    try {
        const response = await api.get(
            `/produto/listarPorId/${id_product}`
        );

        return response.data;
    } catch (error) {
        console.error(
            `Erro ao buscar produto ${id_product}:`,
            error
        );

        throw error;
    }
}