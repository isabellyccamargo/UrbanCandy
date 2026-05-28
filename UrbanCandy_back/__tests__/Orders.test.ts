import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import OrderService from '../src/service/OrderService.js';
import OrderRepository from '../src/repositories/OrderRepository.js';

describe('Order', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('deve lançar erro se o id_people não for enviado (Usuário deslogado)', async () => {
    const cart: any = { items: [{ id: 1 }], total: 50 };

    try {
      await OrderService.checkout(0, cart, 'pix');
      throw new Error('Deveria ter lançado um erro');
    } catch (error: any) {
      expect(error.message).toContain('USER_NOT_FOUND');
    }
  });

  it('deve lançar erro se o método de pagamento estiver vazio', async () => {
    const cart: any = { items: [{ id: 1 }], total: 50 };

    try {
      await OrderService.checkout(1, cart, '');
      throw new Error('Deveria ter lançado um erro');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it('deve barrar total negativo ou zero (Prevenção de fraude no Front)', async () => {
    const cartFraude: any = { items: [{ id: 1 }], total: 0 };

    try {
      await OrderService.checkout(1, cartFraude, 'cartao');
      throw new Error('Deveria ter lançado um erro');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it('deve salvar o pedido com sucesso quando o LocalStorage envia dados íntegros', async () => {
    const cartOk: any = {
      items: [{ id_product: 10, quantity: 1, price: 50 }],
      total: 50,
    };

    const spy = jest
      .spyOn(OrderRepository, 'createFullOrder')
      .mockResolvedValue({ id_order: 123, status: 'success' } as any);

    const res = await OrderService.checkout(1, cartOk, 'boleto');

    expect(spy).toHaveBeenCalledWith(1, cartOk.items, 50, 'boleto');
    expect(res.id_order).toBe(123);
  });
});
