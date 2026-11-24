import { ApiException } from '../exception/ApiException.js';
import PaymentAttemptRepository from '../repositories/PaymentAttemptRepository.js';
import TypeOfDelivery from '../models/TypeOfDelivery.js';
import TypeOfPayment from '../models/TypeOfPayment.js';
import Users from '../models/Users.js';
import { priceCart } from './CartPricingService.js';
import type { ICart } from '../@types/OrdersTypes.js';

type DemoPixCheckout = {
  userId: number;
  peopleId: number;
  id_type_delivery: number;
  cart: ICart;
};

export function assertDemoPixEnabled(nodeEnvironment = process.env.NODE_ENV): void {
  if (nodeEnvironment !== 'development') {
    throw new ApiException(
      'DEMO_PIX_DISABLED',
      404,
      'A confirmação Pix de demonstração está disponível somente no desenvolvimento local.'
    );
  }
}

class DemoPixService {
  async createPaidDemo(input: DemoPixCheckout) {
    assertDemoPixEnabled();

    const [paymentType, deliveryType, user, trustedCart] = await Promise.all([
      TypeOfPayment.findOrCreate({
        where: { name_payment: 'Pix (simulação)' },
        defaults: { name_payment: 'Pix (simulação)' },
      }).then(([type]) => type),
      TypeOfDelivery.findByPk(input.id_type_delivery),
      Users.findByPk(input.userId, { attributes: ['email'] }),
      priceCart(input.cart),
    ]);

    if (!deliveryType) {
      throw new ApiException('DELIVERY_NOT_FOUND', 400, 'Tipo de entrega inválido.');
    }
    if (!user?.email) {
      throw new ApiException('USER_NOT_FOUND', 404, 'Usuário não encontrado.');
    }

    const attempt = await PaymentAttemptRepository.create({
      userId: input.userId,
      peopleId: input.peopleId,
      paymentId: paymentType.id_payment,
      deliveryId: input.id_type_delivery,
      items: trustedCart.items.map((item) => ({
        id_product: item.id_product,
        quantity: item.quantity,
        unit_price: item.products?.price ?? 0,
        sub_total: item.sub_total,
        name: item.products?.name ?? '',
      })),
      total: trustedCart.total,
    });

    try {
      const result = await PaymentAttemptRepository.applyProviderStatus(
        attempt.id,
        `demo-pix:${attempt.id}`,
        'approved'
      );
      if (!result.orderId) {
        throw new Error('A confirmação simulada não criou o pedido esperado.');
      }
      return { attemptId: attempt.id, orderId: result.orderId };
    } catch (error) {
      await attempt.update({ status: 'failed' });
      throw error;
    }
  }
}

export default new DemoPixService();
