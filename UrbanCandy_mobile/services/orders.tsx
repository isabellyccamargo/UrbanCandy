import api from './api';

export type CreateOrderData = {
    id_people: number;
    id_payment: number;
    id_delivery: number;
    cart: {
        items: any[];
        total: number;
    };
};

export const createOrder = async (orderData: any) => {
    try {
        const response = await api.post('/pedido/checkout', orderData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

export async function getMyOrders(
    id_people: number,
    page = 1,
    size = 20
) {
    const response = await api.get(
        `/pedido/usuario/${id_people}`,
        {
            params: {
                page,
                size,
            },
        }
    );

    return response.data;
}

export async function getOrderItems(id_order: number) {
    const response = await api.get(
        `/pedido/${id_order}/itens`
    );

    return response.data;
}   