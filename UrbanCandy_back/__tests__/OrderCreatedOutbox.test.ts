import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import sequelize from '../src/config/Config.js';
import OrderItem from '../src/models/OrderItem.js';
import Orders from '../src/models/Orders.js';
import OrderStatusOutbox from '../src/models/OrderStatusOutbox.js';
import People from '../src/models/People.js';
import Users from '../src/models/Users.js';
import OrderRepository from '../src/repositories/OrderRepository.js';

describe('Order-created outbox', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('stores the order-created event in the same transaction as the order', async () => {
    const transaction = {
      commit: jest.fn(async () => undefined),
      rollback: jest.fn(async () => undefined),
    };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction as never);
    jest.spyOn(Orders, 'create').mockResolvedValue({ id_orders: 42 } as never);
    jest.spyOn(OrderItem, 'bulkCreate').mockResolvedValue([] as never);
    jest.spyOn(People, 'findByPk').mockResolvedValue({ id_user: 7 } as never);
    jest
      .spyOn(Users, 'findByPk')
      .mockResolvedValue({ id_user: 7, email: 'customer@example.com' } as never);
    const createOutboxEvent = jest.spyOn(OrderStatusOutbox, 'create').mockResolvedValue({} as never);

    await OrderRepository.createFullOrder(
      3,
      [{ id_product: 9, quantity: 1, sub_total: 12, products: { price: 12 } }],
      12,
      2,
      1
    );

    expect(createOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: expect.any(String),
        payload: expect.objectContaining({
          eventType: 'order.created',
          orderId: 42,
          recipientUserId: 7,
          recipientEmail: 'customer@example.com',
          total: 12,
        }),
        acknowledgedAt: null,
      }),
      { transaction }
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });
});
