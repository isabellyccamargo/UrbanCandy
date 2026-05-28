import { type Request, type Response, type NextFunction } from 'express';
import OrderService from '../service/OrderService.js';
import { ApiException } from '../exception/ApiException.js';
import { type ICart, type IOrderCheckout } from '../@types/OrdersTypes.js';

class OrderController {
  private static validateRequest(id_people: number, cart: ICart): void {
    if (!id_people || !cart || !cart.items) {
      throw new ApiException(
        'DATA_INCOMPLETE',
        400,
        'Dados insuficientes para processar o pedido.'
      );
    }
  }

  static async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as IOrderCheckout;
      const { id_people, cart, id_payment } = body;

      OrderController.validateRequest(id_people, cart);

      const finalPaymentId = id_payment || 0;

      const result = await OrderService.checkout(id_people, cart, finalPaymentId);

      res.status(201).json({
        message: 'Pedido realizado com sucesso!',
        id_orders: result.id_orders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_people } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const size = req.query.size ? Number(req.query.size) : 6;

      const result = await OrderService.findByUserId(Number(id_people), page, size);

      res.status(200).json({
        totalItems: result.count,
        totalPages: Math.ceil(result.count / size),
        currentPage: page,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const size = req.query.size !== undefined ? Number(req.query.size) : 6;

      const result = await OrderService.findAllOrders(page, size);

      res.status(200).json({
        totalItems: result.count,
        totalPages: size > 0 ? Math.ceil(result.count / size) : 1,
        currentPage: page,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
