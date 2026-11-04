import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Products from '../src/models/Products.js';
import Offers from '../src/models/Offers.js';
import OfferProducts from '../src/models/OfferProducts.js';
import { priceCart } from '../src/service/CartPricingService.js';

describe('priceCart', () => {
  const findAll = jest.spyOn(Products, 'findAll');
  const findOffers = jest.spyOn(Offers, 'findAll');
  const findOfferProducts = jest.spyOn(OfferProducts, 'findAll');

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

  it('uses the active offer price from the database and expands its products', async () => {
    findOffers.mockResolvedValue([
      Offers.build({ id_offer: 3, name_offer: 'Dupla especial', price_offer: '6.00', active: true }),
    ]);
    findOfferProducts.mockResolvedValue([
      OfferProducts.build({ id_offer: 3, id_product: 7, quantity: 1 }),
      OfferProducts.build({ id_offer: 3, id_product: 8, quantity: 1 }),
    ]);
    findAll.mockResolvedValue([
      Products.build({ id_product: 7, name: 'Brigadeiro', price: '4.00' }),
      Products.build({ id_product: 8, name: 'Cookie', price: '6.00' }),
    ]);

    const cart = await priceCart({
      total: 0.01,
      items: [],
      offers: [{ id_offer: 3, quantity: 1 }],
    });

    expect(cart.total).toBe(6);
    expect(cart.items).toHaveLength(2);
    expect(cart.items.map((item) => item.sub_total)).toEqual([2.4, 3.6]);
    expect(findOffers).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ active: true }) })
    );
  });

  it('rejects inactive offers', async () => {
    findOffers.mockResolvedValue([]);

    await expect(
      priceCart({
        total: 1,
        items: [],
        offers: [{ id_offer: 3, quantity: 1 }],
      })
    ).rejects.toMatchObject({ code: 'OFFER_NOT_FOUND' });
    expect(findOfferProducts).not.toHaveBeenCalled();
  });
});
