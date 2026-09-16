import type Address from '../models/Address.js';
import AddressRepository from '../repositories/AddressRepository.js';
import { ApiException } from '../exception/ApiException.js';

class AddressService {
  /**
   * Helper privado para consultar a existência do CEP na API dos Correios (ViaCEP)
   */
  private async validateCepExists(cep: string): Promise<void> {
    const cleanCep = cep.replace(/\D/g, '');

    if (!cleanCep || cleanCep.length !== 8) {
      throw new ApiException('INVALID_CEP_FORMAT', 400);
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

      if (!response.ok) {
        throw new ApiException('ERROR_FETCHING_CEP', 500);
      }

      const data = await response.json();

      // O ViaCEP devolve { erro: "true" } quando o CEP não existe no cadastro nacional
      if (data.erro) {
        throw new ApiException('CEP_NOT_FOUND', 400);
      }
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException('FAILED_TO_VALIDATE_CEP', 500);
    }
  }

  async createAddress(data: Address): Promise<Address> {
    if (!data.cep) {
      throw new ApiException('INVALID_CEP', 400);
    }

    // Normaliza o CEP removendo caracteres especiais
    data.cep = data.cep.replace(/\D/g, '');

    // Valida se o CEP realmente existe na base dos Correios
    await this.validateCepExists(data.cep);

    if (!data.road || !data.city || !data.number) {
      throw new ApiException('REQUIRED_FIELDS_ADDRESS', 400);
    }

    return await AddressRepository.createAddress(data);
  }

  async findAllAddresses(
    page: number = 1,
    size: number = 10
  ): Promise<{ totalItems: number; totalPages: number; currentPage: number; data: Address[] }> {
    const limit = size;
    const offset = (page - 1) * size;
    const result = await AddressRepository.findAllAddresses(limit, offset);

    return {
      totalItems: result.count,
      totalPages: Math.ceil(result.count / size),
      currentPage: page,
      data: result.rows,
    };
  }

  async findByIdAddress(id_address: number): Promise<Address> {
    const address = await AddressRepository.findByIdAddress(id_address);
    if (!address) throw new ApiException('ADDRESS_NOT_FOUND', 404, id_address);
    return address;
  }

  async updateAddress(id_address: number, data: Partial<Address>): Promise<[number]> {
    await this.findByIdAddress(id_address);

    // Se o CEP estiver sendo alterado, limpa e valida se ele existe
    if (data.cep !== undefined) {
      data.cep = data.cep.replace(/\D/g, '');
      await this.validateCepExists(data.cep);
    }

    return await AddressRepository.updateAddress(id_address, data);
  }

  async deleteAddress(id_address: number): Promise<number> {
    await this.findByIdAddress(id_address);
    return await AddressRepository.deleteAddress(id_address);
  }
}

export default new AddressService();
