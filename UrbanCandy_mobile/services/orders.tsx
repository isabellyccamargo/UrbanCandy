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