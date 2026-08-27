import api from './api';

export type PaymentType = {
    id_payment: number;
    name_payment: string;
};

export async function getAllTypeOfPayment(
    page = 1,
    size = 6
): Promise<PaymentType[]> {
    try {
        const response = await api.get('/pagamento/listar', {
            params: {
                page,
                size,
            },
        });

        return response.data ?? [];
    } catch (error) {
        console.error(
            'Erro ao carregar tipos de pagamento:',
            error
        );

        throw error;
    }

    
}