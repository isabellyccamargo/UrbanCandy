import { type Request, type Response, type NextFunction } from 'express';
import OrderService from '../service/OrderService.js';
import { ApiException } from '../exception/ApiException.js';
import { type ICart, type IOrderCheckout } from '../@types/OrdersTypes.js';
import OrderRepository from '../repositories/OrderRepository.js';
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
      const { id_people, cart, id_payment, id_type_delivery } = body;

      OrderController.validateRequest(id_people, cart);

      const finalPaymentId = id_payment || 0;
      const finalDeliveryId = id_type_delivery || 0;

      const result = await OrderService.checkout(
        id_people,
        cart,
        finalPaymentId,
        finalDeliveryId
      );

      res.status(201).json({
        message: 'Pedido realizado com sucesso!',
        id_orders: result.id_orders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByUserId(req: Request, res: Response) {
    try {
      const { id_people } = req.params;

      // Suporta tanto req.query.limit quanto req.query.size (enviado pelo frontend)
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit || req.query.size ? Number(req.query.limit || req.query.size) : 20;
      const offset = (page - 1) * limit;

      const result = await OrderRepository.findByUserId(
        Number(id_people),
        limit,
        offset
      );

      // Retorna a estrutura com a propriedade data (array de pedidos) e metadados
      return res.status(200).json({
        totalItems: result.count,
        totalPages: limit > 0 ? Math.ceil(result.count / limit) : 1,
        currentPage: page,
        data: result.rows,
      });
    } catch (error: any) {
      console.error('--- ERRO DETALHADO SEQUELIZE ---', error);
      return res.status(500).json({
        message: error.message,
        sql: error.sql,
      });
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

  static async findItemsByOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id_order } = req.params;

      const result = await OrderService.findItemsByOrder(
        Number(id_order)
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // <--- NOVAS AÇÕES DO CONTROLLER --->
  static async findAllStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await OrderService.findAllStatuses();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_order } = req.params;
      const { id_order_status } = req.body;

      const result = await OrderService.updateOrderStatus(
        Number(id_order),
        Number(id_order_status)
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;