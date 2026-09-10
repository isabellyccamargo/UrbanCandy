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

export const createOrder = async (orderData: CreateOrderData) => {
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
            params: { page, size },
        }
    );
    return response.data;
}

export async function getAllOrders(page = 1, size = 50) {
    const response = await api.get('/pedido/listar', {
        params: { page, size },
    });
    return response.data;
}
export const updateOrderStatus = async (orderId: number, statusId: number) => {
    const response = await api.patch(`/pedido/${orderId}/status`, {
        id_order_status: statusId,
    });
    return response.data;
};

export const getOrderItems = async (orderId: number) => {
    const response = await api.get(`/pedido/${orderId}/itens`);
    return response.data;
};

export const getOrderStatuses = async () => {
    const response = await api.get('/pedido/status/listar');
    return response.data;
};


