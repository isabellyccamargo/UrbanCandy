import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import OrderService from '../src/service/OrderService.js';
import OrderRepository from '../src/repositories/OrderRepository.js';
import Products from '../src/models/Products.js';

describe('Order', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('deve lançar erro se o id_people não for enviado (Usuário deslogado)', async () => {
    const cart: any = { items: [{ id: 1 }], total: 50 };

    try {
      await OrderService.checkout(0, cart, 1, 1);
      throw new Error('Deveria ter lançado um erro');
    } catch (error: any) {
      expect(error.code).toBe('USER_NOT_FOUND');
    }
  });

  it('deve lançar erro se o método de pagamento estiver vazio', async () => {
    const cart: any = { items: [{ id: 1 }], total: 50 };

    try {
      await OrderService.checkout(1, cart, 0, 1);
      throw new Error('Deveria ter lançado um erro');
    } catch (error: any) {
      expect(error.code).toBe('PAYMENT_REQUIRED');
    }
  });

  it('deve barrar carrinho vazio antes de criar o pedido', async () => {
    const cartFraude: any = { items: [], total: 50 };

    try {
      await OrderService.checkout(1, cartFraude, 1, 1);
      throw new Error('Deveria ter lançado um erro');
    } catch (error: any) {
      expect(error.code).toBe('CART_EMPTY');
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
    jest
      .spyOn(Products, 'findAll')
      .mockResolvedValue([
        Products.build({ id_product: 10, name: 'Doce', price: '50.00' }),
      ]);

    const res = await OrderService.checkout(1, cartOk, 1, 1);

    expect(spy).toHaveBeenCalledWith(
      1,
      [
        {
          id_product: 10,
          quantity: 1,
          sub_total: 50,
          products: { price: 50, name: 'Doce' },
        },
      ],
      50,
      1,
      1,
      1
    );
    expect(res.id_order).toBe(123);
  });
});
