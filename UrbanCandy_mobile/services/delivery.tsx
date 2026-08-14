import api from './api';

export async function getAllDeliveryTypes() {
    return api.get('/entrega/listar');
}