import sequelize from '../config/Config.js';
import type { ICartItem } from '../@types/OrdersTypes.js';
import OrderRepository from './OrderRepository.js';
import PaymentAttempt, {
  type PaymentAttemptStatus,
  type PaymentCartItem,
} from '../models/PaymentAttempt.js';

class PaymentAttemptRepository {
  async create(input: {
    userId: number;
    peopleId: number;
    paymentId: number;
    deliveryId: number;
    items: PaymentCartItem[];
    total: number;
  }): Promise<PaymentAttempt> {
    return PaymentAttempt.create({
      user_id: input.userId,
      id_people: input.peopleId,
      id_payment: input.paymentId,
      id_type_delivery: input.deliveryId,
      cart_snapshot: input.items,
      total: input.total,
      status: 'pending',
    });
  }

  async setPreference(id: string, preferenceId: string): Promise<void> {
    await PaymentAttempt.update({ preference_id: preferenceId }, { where: { id } });
  }

  async findById(id: string): Promise<PaymentAttempt | null> {
    return PaymentAttempt.findByPk(id);
  }

  async findOwnedByUser(id: string, userId: number): Promise<PaymentAttempt | null> {
    return PaymentAttempt.findOne({ where: { id, user_id: userId } });
  }

  async applyProviderStatus(
    attemptId: string,
    providerPaymentId: string,
    status: PaymentAttemptStatus
  ): Promise<{ status: PaymentAttemptStatus; orderId: number | null }> {
    const transaction = await sequelize.transaction();

    try {
      const attempt = await PaymentAttempt.findByPk(attemptId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!attempt) {
        throw new Error(`Tentativa de pagamento ${attemptId} não encontrada.`);
      }

      if (attempt.status === 'approved' && attempt.id_order) {
        await transaction.commit();
        return { status: 'approved', orderId: attempt.id_order };
      }

      if (status !== 'approved') {
        if (attempt.status === 'pending') {
          await attempt.update(
            {
              status,
              provider_payment_id: providerPaymentId,
            },
            { transaction }
          );
        }
        await transaction.commit();
        return { status: attempt.status, orderId: attempt.id_order };
      }

      const cartItems: ICartItem[] = attempt.cart_snapshot.map((item) => ({
        id_product: item.id_product,
        quantity: item.quantity,
        sub_total: item.sub_total,
        products: {
          price: item.unit_price,
          name: item.name,
        },
      }));
      const order = await OrderRepository.createFullOrder(
        attempt.id_people,
        cartItems,
        Number(attempt.total),
        attempt.id_payment,
        attempt.id_type_delivery,
        1,
        transaction
      );

      await attempt.update(
        {
          status: 'approved',
          provider_payment_id: providerPaymentId,
          id_order: order.id_orders,
        },
        { transaction }
      );

      await transaction.commit();
      return { status: 'approved', orderId: order.id_orders };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new PaymentAttemptRepository();
