import type Address from '../models/Address.js';
import AddressRepository from '../repositories/AddressRepository.js';
import { ApiException } from '../exception/ApiException.js';

class AddressService {
  async createAddress(data: Address): Promise<Address> {
    if (!data.cep || data.cep.length !== 8) {
      throw new ApiException('INVALID_CEP', 400);
    }
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
    return await AddressRepository.updateAddress(id_address, data);
  }

  async deleteAddress(id_address: number): Promise<number> {
    await this.findByIdAddress(id_address);
    return await AddressRepository.deleteAddress(id_address);
  }
}

export default new AddressService();
