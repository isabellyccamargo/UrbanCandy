import type { NextFunction, Request, Response } from 'express';
import { ApiException } from '../exception/ApiException.js';
import People from '../models/People.js';
import Users from '../models/Users.js';
import DemoPixService, { assertDemoPixEnabled } from '../service/DemoPixService.js';
import { requireVerifiedEmail } from '../service/EmailVerificationGuard.js';

class DemoPixController {
  static async confirm(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      assertDemoPixEnabled();
      const userId = Number(request.userId);
      if (!userId) {
        throw new ApiException('UNAUTHORIZED', 401, 'Usuário não autenticado.');
      }

      const user = await Users.findByPk(userId, { attributes: ['email'] });
      if (!user) throw new ApiException('USER_NOT_FOUND', 404);
      await requireVerifiedEmail(user.email, userId);

      const person = await People.findOne({
        where: { id_user: userId },
        attributes: ['id_people'],
      });
      if (!person) {
        throw new ApiException('USER_PROFILE_NOT_FOUND', 404, 'Perfil do cliente não encontrado.');
      }

      const result = await DemoPixService.createPaidDemo({
        userId,
        peopleId: person.id_people,
        id_type_delivery: Number(request.body?.id_type_delivery),
        cart: request.body?.cart,
      });
      response.status(201).json({
        message: 'Pagamento Pix de demonstração confirmado.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DemoPixController;
