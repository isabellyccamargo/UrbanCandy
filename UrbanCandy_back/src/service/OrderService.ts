import { ApiException } from '../exception/ApiException.js';
import OrderRepository from '../repositories/OrderRepository.js';
import { type ICart } from '../@types/OrdersTypes.js';
import OrderItemRepository from '../repositories/OrderItemRepository.js';

class OrderService {
  static async checkout(
    id_people: number,
    cart: ICart,
    id_payment: number,
    id_type_delivery: number
  ) {
    this.validateCheckoutData(id_people, cart, id_payment, id_type_delivery);

    return await OrderRepository.createFullOrder(
      id_people,
      cart.items,
      cart.total,
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

    if (cart.total <= 0) {
      throw new ApiException('INVALID_TOTAL', 400, 'Total inválido.');
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

    const [affectedRows] = await OrderRepository.updateOrderStatus(id_order, status_id);

    if (affectedRows === 0) {
      throw new ApiException('ORDER_NOT_FOUND', 404, 'Pedido não encontrado.');
    }

    return { message: 'Status do pedido atualizado com sucesso.' };
  }
}

export default OrderService;
