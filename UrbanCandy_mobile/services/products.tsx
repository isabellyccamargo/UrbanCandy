import api from './api';

/**
 * Helper para formatar a URL da imagem do produto.
 * Concatena caminhos relativos com a baseURL da API.
 */
export function formatImageUrl(imagePath?: string): string {
    if (!imagePath) {
        return 'https://via.placeholder.com/150';
    }

    // Se já for uma URL completa (ex: Cloudinary, S3 ou HTTPS externa)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        // Se for HTTP no Android, substitui por HTTPS se suportado
        return imagePath.replace('http://', 'https://');
    }

    // Imagens são servidas em /uploads, fora do prefixo /api.
    const baseURL = api.defaults.baseURL || '';
    const cleanBaseUrl = baseURL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${cleanBaseUrl}${cleanPath}`;
}

export async function getAllProducts(page = 1, size = 6) {
    try {
        const response = await api.get('/produto/listar', {
            params: { page, size },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
    }
}

export async function getFeaturedProducts(page = 1, size = 6) {
    try {
        const response = await api.get('/produto/listar', {
            params: { page, size },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar produtos em destaque:', error);
        throw error;
    }
}

export async function getProductsByCategory(categoryName: string, page = 1, size = 50) {
    try {
        const response = await api.get(`/produto/categoria/${categoryName}`, {
            params: { page, size },
        });

        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar produtos da categoria ${categoryName}:`, error);
        throw error;
    }
}

export async function getProductById(id_product: number) {
    try {
        const response = await api.get(`/produto/listarPorId/${id_product}`);

        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar produto ${id_product}:`, error);
        throw error;
    }
}