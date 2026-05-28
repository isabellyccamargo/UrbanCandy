import { type Request, type Response, type NextFunction } from 'express';
import TypeOfPaymentService from '../service/TypeOfPaymentService.js';
import TypeOfPayment from '../models/TypeOfPayment.js';
import { ApiException } from '../exception/ApiException.js';

class TypeOfPaymentController {
  static async findAllTypeOfPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const size = Number(req.query.size) || 6;

      const result = await TypeOfPaymentService.findAllTypeOfPayment(page, size);

      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async findByIdTypeOfPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id_payment } = req.params;

      if (!id_payment || Array.isArray(id_payment)) {
        throw new ApiException('INVALID_ID', 400, 'id_payment');
      }

      const id: number = Number(id_payment);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_payment);
      }

      const type = await TypeOfPaymentService.findByIdTypeOfPayment(id);

      res.status(200).json(type);
    } catch (error) {
      next(error);
    }
  }

  static async createTypeOfPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const typeInstance = TypeOfPayment.build(req.body);

      const newType = await TypeOfPaymentService.createTypeOfPayment(typeInstance);

      res.status(201).json(newType);
    } catch (error) {
      next(error);
    }
  }

  static async updateTypeOfPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_payment } = req.params;

      if (!id_payment || Array.isArray(id_payment)) {
        throw new ApiException('INVALID_ID', 400, 'id_payment');
      }

      const id: number = Number(id_payment);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_payment);
      }

      const typeInstance = TypeOfPayment.build(req.body);

      await TypeOfPaymentService.updateTypeOfPayment(id, typeInstance);

      res.status(200).json({
        message: 'Tipo de pagamento atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTypeOfPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_payment } = req.params;

      if (!id_payment || Array.isArray(id_payment)) {
        throw new ApiException('INVALID_ID', 400, 'id_payment');
      }

      const id: number = Number(id_payment);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_payment);
      }

      await TypeOfPaymentService.deleteTypeOfPayment(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default TypeOfPaymentController;
