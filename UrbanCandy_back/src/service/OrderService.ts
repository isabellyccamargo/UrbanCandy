import { ApiException } from '../exception/ApiException.js';
import OrderRepository from '../repositories/OrderRepository.js';
import { type ICart } from '../@types/OrdersTypes.js';
import OrderItemRepository from '../repositories/OrderItemRepository.js';
import Users from '../models/Users.js';
import People from '../models/People.js';
import { priceCart } from './CartPricingService.js';

class OrderService {
  static async checkout(
    id_people: number,
    cart: ICart,
    id_payment: number,
    id_type_delivery: number
  ) {
    this.validateCheckoutData(id_people, cart, id_payment, id_type_delivery);
    const pricedCart = await priceCart(cart);

    return await OrderRepository.createFullOrder(
      id_people,
      pricedCart.items,
      pricedCart.total,
      id_payment,
      id_type_delivery,
      1 // Inicia sempre com o id_order_status = 1 ("Recebido")
    );
  }

  private static validateCheckoutData(
    id_people: number,
    cart: ICart,
    id_payment: number,
    id_type_delivery: number
  ): void {
    if (!id_people || id_people <= 0) {
      throw new ApiException('USER_NOT_FOUND', 401, 'Usuário inválido.');
    }

    if (!cart?.items?.length) {
      throw new ApiException('CART_EMPTY', 400, 'Carrinho vazio.');
    }

    if (!id_payment || id_payment <= 0) {
      throw new ApiException('PAYMENT_REQUIRED', 400, 'Método de pagamento obrigatório.');
    }

    if (!id_type_delivery || id_type_delivery <= 0) {
      throw new ApiException('DELIVERY_REQUIRED', 400, 'Tipo de entrega obrigatório.');
    }
  }

  static async findAllOrders(page: number = 1, size: number = 6) {
    const offset = (page - 1) * size;
    return await OrderRepository.findAllOrders(size, offset);
  }

  static async findByUserId(id_people: number, page: number = 1, size: number = 6) {
    const offset = (page - 1) * size;
    return await OrderRepository.findByUserId(id_people, size, offset);
  }

  static async findItemsByOrder(id_order: number) {
    return await OrderItemRepository.findItemsByOrder(id_order);
  }

  static async findAllStatuses() {
    return await OrderRepository.findAllStatuses();
  }

  static async updateOrderStatus(id_order: number, status_id: number) {
    if (!id_order || id_order <= 0) {
      throw new ApiException('INVALID_ORDER_ID', 400, 'ID do pedido inválido.');
    }
    if (!status_id || status_id <= 0) {
      throw new ApiException('INVALID_STATUS_ID', 400, 'ID de status inválido.');
    }

    const order = await OrderRepository.findById(id_order);
    if (!order) {
      throw new ApiException('ORDER_NOT_FOUND', 404, 'Pedido não encontrado.');
    }

    const previousStatusId = Number(order.status_id);
    if (previousStatusId === status_id) {
      return { message: 'Status do pedido atualizado com sucesso.' };
    }

    const [person, newStatus] = await Promise.all([
      People.findByPk(order.id_people, { attributes: ['id_user'] }),
      OrderRepository.findStatusById(status_id),
    ]);
    if (!person) {
      throw new ApiException('USER_PROFILE_NOT_FOUND', 404, 'Perfil do cliente não encontrado.');
    }
    if (!newStatus) {
      throw new ApiException('INVALID_STATUS_ID', 400, 'Status do pedido não encontrado.');
    }
    const recipient = await Users.findByPk(Number(person.id_user), {
      attributes: ['id_user', 'email'],
    });
    if (!recipient) {
      throw new ApiException('USER_PROFILE_NOT_FOUND', 404, 'Cliente do pedido não encontrado.');
    }
    const event = await OrderRepository.updateOrderStatusAndQueueEvent(
      id_order,
      previousStatusId,
      status_id,
      Number(recipient.id_user),
      recipient.email,
      newStatus.label || newStatus.name
    );
    if (!event) {
      throw new ApiException('ORDER_STATUS_CONFLICT', 409);
    }
    return { message: 'Status do pedido atualizado com sucesso.' };
  }

  static async cancelOrder(id_order: number, userId: number) {
    if (!id_order || id_order <= 0) {
      throw new ApiException('INVALID_ORDER_ID', 400, 'ID do pedido inválido.');
    }

    if (!userId || userId <= 0) {
      throw new ApiException('INVALID_USER_ID', 401, 'Usuário não autenticado.');
    }

    const order = await OrderRepository.findById(id_order);
    if (!order) {
      throw new ApiException('ORDER_NOT_FOUND', 404, 'Pedido não encontrado.');
    }

    const user = await Users.findByPk(userId, {
      attributes: ['id_user', 'email'],
      include: [{ model: People, as: 'people', attributes: ['id_people'] }],
    });

    const requesterPeopleId =
      user && 'people' in user
        ? Number((user as { people?: { id_people?: number } | null }).people?.id_people ?? 0)
        : 0;

    if (!user || !requesterPeopleId || requesterPeopleId <= 0) {
      throw new ApiException('USER_PROFILE_NOT_FOUND', 404, 'Perfil do usuário não encontrado.');
    }

    if (order.id_people !== requesterPeopleId) {
      throw new ApiException(
        'UNAUTHORIZED',
        403,
        'Você não tem permissão para cancelar este pedido.'
      );
    }

    const STATUS_RECEBIDO_ID = 1;
    const STATUS_CANCELADO_ID = 5;

    if (Number(order.status_id) !== STATUS_RECEBIDO_ID) {
      throw new ApiException(
        'CANNOT_CANCEL_ORDER',
        400,
        'Este pedido já avançou no preparo e não pode mais ser cancelado.'
      );
    }

    const cancelledStatus = await OrderRepository.findStatusById(STATUS_CANCELADO_ID);
    if (!cancelledStatus) {
      throw new ApiException('INVALID_STATUS_ID', 400, 'Status de cancelamento não encontrado.');
    }

    const event = await OrderRepository.updateOrderStatusAndQueueEvent(
      id_order,
      Number(order.status_id),
      STATUS_CANCELADO_ID,
      userId,
      user.email,
      cancelledStatus.label || cancelledStatus.name
    );
    if (!event) throw new ApiException('ORDER_STATUS_CONFLICT', 409);
    return { message: 'Pedido cancelado com sucesso.' };
  }
}

export default OrderService;
