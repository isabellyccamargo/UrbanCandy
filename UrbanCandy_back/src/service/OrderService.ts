import { ApiException } from '../exception/ApiException.js';
import OrderRepository from '../repositories/OrderRepository.js';
import { type ICart } from '../@types/OrdersTypes.js';

class OrderService {
  static async checkout(id_people: number, cart: ICart, id_payment: number) {
    this.validateCheckoutData(id_people, cart, id_payment);
    return await OrderRepository.createFullOrder(id_people, cart.items, cart.total, id_payment);
  }

  private static validateCheckoutData(id_people: number, cart: ICart, id_payment: number): void {
    if (!id_people || id_people <= 0)
      throw new ApiException('USER_NOT_FOUND', 401, 'Usuário inválido.');
    if (!cart?.items?.length) throw new ApiException('CART_EMPTY', 400, 'Carrinho vazio.');
    if (cart.total <= 0) throw new ApiException('INVALID_TOTAL', 400, 'Total inválido.');
    if (!id_payment || id_payment <= 0)
      throw new ApiException('PAYMENT_REQUIRED', 400, 'Método de pagamento obrigatório.');
  }

  private static validateCart(cart: ICart): void {
    if (!cart?.items?.length) {
      throw new ApiException('CART_EMPTY', 400, 'Carrinho vazio');
    }
    if (cart.total <= 0) {
      throw new ApiException('INVALID_TOTAL', 400, 'Total deve ser maior que zero');
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
}

export default OrderService;
