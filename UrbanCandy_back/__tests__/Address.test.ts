import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import AddressService from '../src/service/AddressService.js';
import AddressRepository from '../src/repositories/AddressRepository.js';

describe('AddressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve validar campos obrigatórios na criação do endereço', async () => {
    const incompleto: any = { cep: '12545678', road: '' };

    await expect(AddressService.createAddress(incompleto)).rejects.toThrow(
      'REQUIRED_FIELDS_ADDRESS'
    );
  });

  test('deve calcular a paginação corretamente', async () => {
    jest
      .spyOn(AddressRepository, 'findAllAddresses')
      .mockResolvedValue({ count: 25, rows: [] } as any);

    const result = await AddressService.findAllAddresses(1, 10);

    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(25);
  });

  test('deve lançar erro ao deletar endereço não encontrado', async () => {
    jest.spyOn(AddressRepository, 'findByIdAddress').mockResolvedValue(null);

    await expect(AddressService.deleteAddress(50)).rejects.toThrow('ADDRESS_NOT_FOUND');
  });
});
