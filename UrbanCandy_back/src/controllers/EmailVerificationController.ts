import { type NextFunction, type Request, type Response } from 'express';
import Users from '../models/Users.js';
import {
  confirmEmailVerification,
  getEmailVerificationStatus,
  requestEmailVerification,
} from '../service/EmailServiceClient.js';

function serviceErrorStatus(error: unknown): number {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    if (status >= 400 && status < 500) return status;
  }
  return 503;
}

function serviceErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

class EmailVerificationController {
  static async requestForAuthenticatedUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await Users.findByPk(Number(req.userId), { attributes: ['id_user', 'email'] });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      const result = await requestEmailVerification(user.email, user.id_user);
      res.status(202).json(result);
    } catch (error) {
      const status = serviceErrorStatus(error);
      if (status === 503) {
        res.status(503).json({
          message: 'Não foi possível solicitar o código agora. Tente novamente mais tarde.',
        });
        return;
      }
      res.status(status).json({
        message: serviceErrorMessage(error, 'Não foi possível solicitar o código.'),
      });
    }
  }

  static async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body as { email?: unknown; code?: unknown };
      if (typeof email !== 'string' || typeof code !== 'string') {
        res.status(400).json({ message: 'Informe o e-mail e o código de 6 dígitos.' });
        return;
      }
      const result = await confirmEmailVerification(email, code);
      res.status(200).json(result);
    } catch (error) {
      const status = serviceErrorStatus(error);
      if (status === 503) {
        res.status(503).json({
          message: 'Não foi possível confirmar o código agora. Tente novamente mais tarde.',
        });
        return;
      }
      res.status(status).json({
        message: serviceErrorMessage(error, 'Código inválido ou expirado.'),
      });
    }
  }

  static async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await Users.findByPk(Number(req.userId), { attributes: ['email'] });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      const result = await getEmailVerificationStatus(user.email);
      res.status(200).json(result);
    } catch (error) {
      if (serviceErrorStatus(error) === 503) {
        res.status(503).json({
          message: 'Não foi possível consultar a confirmação do e-mail agora.',
        });
        return;
      }
      next(error);
    }
  }
}

export default EmailVerificationController;
