import api from './api';

export type PaymentType = {
    id_payment: number;
    name_payment: string;
};

export type PaymentMethodKind = 'pix' | 'card' | 'cash' | 'both';

export type PaymentCheckoutStatus = {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'failed';
    id_order: number | null;
    total: number;
};

export function getPaymentMethodKind(name: string): PaymentMethodKind {
    const normalized = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('dinheiro') || normalized.includes('cash')) return 'cash';
    if (normalized.includes('pix')) return 'pix';
    if (
        normalized.includes('cartao') ||
        normalized.includes('credito') ||
        normalized.includes('debito') ||
        normalized.includes('card')
    ) {
        return 'card';
    }
    return 'both';
}

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

export async function createPaymentCheckout(input: {
    id_payment: number;
    id_type_delivery: number;
    payment_method: 'pix' | 'card' | 'both';
    cart: { items: { id_product: number; quantity: number }[]; total: number };
}): Promise<{ attemptId: string; checkoutUrl: string; total: number }> {
    const response = await api.post('/pagamento/checkout', input);
    return response.data;
}

export async function getPaymentCheckoutStatus(
    attemptId: string
): Promise<PaymentCheckoutStatus> {
    const response = await api.get(`/pagamento/checkout/${attemptId}`);
    return response.data;
}