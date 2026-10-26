import type { NextFunction, Request, Response } from 'express';
import { ApiException } from '../exception/ApiException.js';
import People from '../models/People.js';
import MercadoPagoService from '../service/MercadoPagoService.js';

class MercadoPagoController {
  static async createCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.userId);
      if (!userId) {
        throw new ApiException('UNAUTHORIZED', 401, 'Usuário não autenticado.');
      }

      const person = await People.findOne({
        where: { id_user: userId },
        attributes: ['id_people'],
      });
      if (!person) {
        throw new ApiException('USER_PROFILE_NOT_FOUND', 404, 'Perfil do cliente não encontrado.');
      }

      const result = await MercadoPagoService.createCheckout({
        userId,
        peopleId: person.id_people,
        id_payment: Number(req.body?.id_payment),
        id_type_delivery: Number(req.body?.id_type_delivery),
        paymentMethod:
          req.body?.payment_method === 'pix' || req.body?.payment_method === 'card'
            ? req.body.payment_method
            : 'both',
        cart: req.body?.cart,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Number(req.userId);
      if (!userId) {
        throw new ApiException('UNAUTHORIZED', 401, 'Usuário não autenticado.');
      }
      const attemptId = req.params.id;
      if (typeof attemptId !== 'string') {
        throw new ApiException('INVALID_PAYMENT_ATTEMPT_ID', 400, 'ID do pagamento inválido.');
      }
      const result = await MercadoPagoService.getStatus(attemptId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await MercadoPagoService.receiveWebhook(
        req.body,
        req.query['data.id'],
        req.header('x-signature'),
        req.header('x-request-id')
      );
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}

export default MercadoPagoController;
