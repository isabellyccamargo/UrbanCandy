import Address from '../models/Address.js';

class AddressRepository {
  async createAddress(address: Address): Promise<Address> {
    return await Address.create();
  }

  async findAllAddresses(
    limit: number,
    offset: number
  ): Promise<{ rows: Address[]; count: number }> {
    return await Address.findAndCountAll({ limit, offset });
  }

  async findByIdAddress(id_address: number): Promise<Address | null> {
    return await Address.findByPk(id_address);
  }

  async updateAddress(id_address: number, data: Partial<Address>): Promise<[number]> {
    return await Address.update(data, { where: { id_address } });
  }

  async deleteAddress(id_address: number): Promise<number> {
    return await Address.destroy({ where: { id_address } });
  }
}

export default new AddressRepository();
