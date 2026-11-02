import { type Request, type Response } from 'express';
import Users from '../models/Users.js';
import UserService from '../service/UserService.js';
import {
  associateVerifiedEmail,
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
  static async requestForRegistration(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body as { email?: unknown };
      if (typeof email !== 'string') {
        res.status(400).json({ message: 'Informe um endereço de e-mail válido.' });
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await Users.findOne({
        where: { email: normalizedEmail },
        attributes: ['id_user'],
      });
      if (existingUser) {
        res.status(409).json({
          message: 'Este e-mail já possui uma conta. Entre ou recupere o acesso.',
        });
        return;
      }
      const result = await requestEmailVerification(normalizedEmail, null, true);
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

  static async requestForAuthenticatedUser(
    req: Request,
    res: Response
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

  static async confirm(req: Request, res: Response): Promise<void> {
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

  static async status(req: Request, res: Response): Promise<void> {
    try {
      const user = await Users.findByPk(Number(req.userId), { attributes: ['email'] });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      let result = await getEmailVerificationStatus(user.email);
      if (result.verified && result.userId === null) {
        await associateVerifiedEmail(user.email, user.id_user);
        result = { verified: true, userId: user.id_user };
      }
      res.status(200).json(result);
    } catch (error) {
      const status = serviceErrorStatus(error);
      res.status(status).json({
        message:
          status === 503
            ? 'Não foi possível consultar a confirmação do e-mail agora.'
            : serviceErrorMessage(error, 'Não foi possível consultar a confirmação do e-mail.'),
      });
    }
  }

  static async requestEmailChange(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body as { email?: unknown };
      if (typeof email !== 'string') {
        res.status(400).json({ message: 'Informe o novo endereço de e-mail.' });
        return;
      }
      const user = await Users.findByPk(Number(req.userId), {
        attributes: ['id_user', 'email'],
      });
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado.' });
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === user.email.trim().toLowerCase()) {
        res.status(400).json({ message: 'Informe um endereço diferente do e-mail atual.' });
        return;
      }
      const existingUser = await Users.findOne({
        where: { email: normalizedEmail },
        attributes: ['id_user'],
      });
      if (existingUser) {
        res.status(409).json({ message: 'Este endereço já está associado a outra conta.' });
        return;
      }
      const result = await requestEmailVerification(normalizedEmail, user.id_user, true);
      res.status(202).json(result);
    } catch (error) {
      const status = serviceErrorStatus(error);
      res.status(status).json({
        message:
          status === 503
            ? 'Não foi possível solicitar o código agora. Tente novamente mais tarde.'
            : serviceErrorMessage(error, 'Não foi possível solicitar o código.'),
      });
    }
  }

  static async confirmEmailChange(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email, code } = req.body as { email?: unknown; code?: unknown };
      if (typeof email !== 'string' || typeof code !== 'string') {
        res.status(400).json({ message: 'Informe o novo e-mail e o código de 6 dígitos.' });
        return;
      }
      const userId = Number(req.userId);
      await confirmEmailVerification(email, code);
      const verification = await getEmailVerificationStatus(email);
      if (verification.userId !== userId) {
        res.status(403).json({ message: 'A validação não pertence à sua conta.' });
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      await UserService.updateEmail(userId, normalizedEmail);
      res.status(200).json({ verified: true, email: normalizedEmail });
    } catch (error) {
      const status = serviceErrorStatus(error);
      res.status(status).json({
        message:
          status === 503
            ? 'Não foi possível confirmar o código agora. Tente novamente mais tarde.'
            : serviceErrorMessage(error, 'Não foi possível alterar o e-mail.'),
      });
    }
  }
}

export default EmailVerificationController;
