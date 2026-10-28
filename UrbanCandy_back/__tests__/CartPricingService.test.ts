import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Products from '../src/models/Products.js';
import { priceCart } from '../src/service/CartPricingService.js';

describe('priceCart', () => {
  const findAll = jest.spyOn(Products, 'findAll');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses current database prices instead of client-supplied totals or prices', async () => {
    findAll.mockResolvedValue([
      Products.build({ id_product: 7, name: 'Brigadeiro', price: '4.25' }),
    ]);

    const cart = await priceCart({
      total: 0.01,
      items: [
        {
          id_product: 7,
          quantity: 2,
          sub_total: 0.02,
          products: { price: 0.01, name: 'Preço adulterado' },
        },
      ],
    });

    expect(cart.total).toBe(8.5);
    expect(cart.items[0]).toMatchObject({
      id_product: 7,
      quantity: 2,
      sub_total: 8.5,
      products: { price: 4.25, name: 'Brigadeiro' },
    });
  });

  it('rejects invalid quantities', async () => {
    await expect(
      priceCart({
        total: 10,
        items: [{ id_product: 7, quantity: 0, sub_total: 10 }],
      })
    ).rejects.toMatchObject({ code: 'INVALID_QUANTITY' });
    expect(findAll).not.toHaveBeenCalled();
  });

  it('rejects products that are no longer in the database', async () => {
    findAll.mockResolvedValue([]);

    await expect(
      priceCart({
        total: 10,
        items: [{ id_product: 404, quantity: 1, sub_total: 10 }],
      })
    ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND' });
  });
});
