import api from './api';

export type AddressData = {
    cep?: string;
    city?: string;
    neighborhood?: string;
    road?: string;
    number?: number;
    complement?: string;
};

export async function updateAddress(
    id_address: number,
    addressData: AddressData
) {
    const response = await api.put(
        `/endereco/atualizar/${id_address}`,
        addressData
    );

    return response.data;
}