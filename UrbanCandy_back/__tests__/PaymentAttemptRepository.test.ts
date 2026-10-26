import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import sequelize from '../src/config/Config.js';
import OrderRepository from '../src/repositories/OrderRepository.js';
import PaymentAttemptRepository from '../src/repositories/PaymentAttemptRepository.js';
import PaymentAttempt from '../src/models/PaymentAttempt.js';

describe('PaymentAttemptRepository', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an order and marks the attempt approved in one transaction', async () => {
    const transaction = {
      LOCK: { UPDATE: 'UPDATE' },
      commit: jest.fn(async () => undefined),
      rollback: jest.fn(async () => undefined),
    };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction as never);
    const attempt = {
      status: 'pending',
      id_order: null,
      id_people: 3,
      id_payment: 4,
      id_type_delivery: 2,
      total: '8.50',
      cart_snapshot: [
        {
          id_product: 7,
          quantity: 2,
          unit_price: 4.25,
          sub_total: 8.5,
          name: 'Brigadeiro',
        },
      ],
      update: jest.fn(async function (
        this: Record<string, unknown>,
        values: Record<string, unknown>
      ) {
        Object.assign(this, values);
      }),
    };
    jest.spyOn(PaymentAttempt, 'findByPk').mockResolvedValue(attempt as never);
    const createOrder = jest
      .spyOn(OrderRepository, 'createFullOrder')
      .mockResolvedValue({ id_orders: 42 } as never);

    const result = await PaymentAttemptRepository.applyProviderStatus(
      'attempt-id',
      'provider-payment-id',
      'approved'
    );

    expect(result).toEqual({ status: 'approved', orderId: 42 });
    expect(createOrder).toHaveBeenCalledWith(
      3,
      [
        {
          id_product: 7,
          quantity: 2,
          sub_total: 8.5,
          products: { price: 4.25, name: 'Brigadeiro' },
        },
      ],
      8.5,
      4,
      2,
      1,
      transaction
    );
    expect(attempt.update).toHaveBeenCalledWith(
      {
        status: 'approved',
        provider_payment_id: 'provider-payment-id',
        id_order: 42,
      },
      { transaction }
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });

  it('does not create a duplicate order when approval is delivered again', async () => {
    const transaction = {
      LOCK: { UPDATE: 'UPDATE' },
      commit: jest.fn(async () => undefined),
      rollback: jest.fn(async () => undefined),
    };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction as never);
    jest.spyOn(PaymentAttempt, 'findByPk').mockResolvedValue({
      status: 'approved',
      id_order: 42,
    } as never);
    const createOrder = jest.spyOn(OrderRepository, 'createFullOrder');

    const result = await PaymentAttemptRepository.applyProviderStatus(
      'attempt-id',
      'provider-payment-id',
      'approved'
    );

    expect(result).toEqual({ status: 'approved', orderId: 42 });
    expect(createOrder).not.toHaveBeenCalled();
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });
});
