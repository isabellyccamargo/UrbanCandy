import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import TypeOfPaymentService from '../src/service/TypeOfPaymentService.js';
import TypeOfPaymentRepository from '../src/repositories/TypeOfPaymentRepository.js';

describe('TypeOfPaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve validar campos obrigatórios na criação do tipo de pagamento', async () => {
    const incompleto: any = { name_payment: '' };

    await expect(TypeOfPaymentService.createTypeOfPayment(incompleto)).rejects.toThrow(
      'INVALID_TYPE_OF_PAYMENT_NAME'
    );
  });

  test('deve chamar o repositório com o offset correto na paginação', async () => {
    const mockResponse = { count: 25, rows: [] };
    jest
      .spyOn(TypeOfPaymentRepository, 'findAllTypeOfPayment')
      .mockResolvedValue(mockResponse as any);

    const page = 2;
    const size = 10;
    const result = await TypeOfPaymentService.findAllTypeOfPayment(page, size);

    expect(TypeOfPaymentRepository.findAllTypeOfPayment).toHaveBeenCalledWith(size, 10);
    expect(result.count).toBe(25);
  });

  test('deve lançar erro ao deletar tipo de pagamento não encontrado', async () => {
    jest.spyOn(TypeOfPaymentRepository, 'findByIdTypeOfPayment').mockResolvedValue(null);

    await expect(TypeOfPaymentService.deleteTypeOfPayment(50)).rejects.toThrow(
      'TYPE_OF_PAYMENT_NOT_FOUND'
    );
  });
});
