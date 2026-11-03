import { type NextFunction, type Request, type Response } from 'express';
import Users from '../models/Users.js';
import UserService from '../service/UserService.js';
import {
  associateVerifiedEmail,
  confirmEmailVerification,
  getEmailVerificationStatus,
  requestEmailVerification,
} from '../service/EmailServiceClient.js';
import { ApiException } from '../exception/ApiException.js';

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

function toApiException(error: unknown, fallbackMessage: string): ApiException {
  const status = serviceErrorStatus(error);
  if (status === 503) {
    return new ApiException('EMAIL_SERVICE_UNAVAILABLE', 503);
  }
  return new ApiException(
    'EMAIL_VERIFICATION_ERROR',
    status,
    serviceErrorMessage(error, fallbackMessage)
  );
}

class EmailVerificationController {
  static async requestForRegistration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body as { email?: unknown };
      if (typeof email !== 'string') {
        throw new ApiException('INVALID_EMAIL_REGISTRATION_REQUEST', 400);
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await Users.findOne({
        where: { email: normalizedEmail },
        attributes: ['id_user'],
      });
      if (existingUser) {
        throw new ApiException('EMAIL_ALREADY_REGISTERED', 409);
      }
      try {
        const result = await requestEmailVerification(normalizedEmail, null, true);
        res.status(202).json(result);
      } catch (error) {
        next(toApiException(error, 'Não foi possível solicitar o código.'));
      }
    } catch (error) {
      next(error);
    }
  }

  static async requestForAuthenticatedUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await Users.findByPk(Number(req.userId), { attributes: ['id_user', 'email'] });
      if (!user) {
        throw new ApiException('USER_NOT_FOUND', 404);
      }
      try {
        const result = await requestEmailVerification(user.email, user.id_user);
        res.status(202).json(result);
      } catch (error) {
        next(toApiException(error, 'Não foi possível solicitar o código.'));
      }
    } catch (error) {
      next(error);
    }
  }

  static async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body as { email?: unknown; code?: unknown };
      if (typeof email !== 'string' || typeof code !== 'string') {
        throw new ApiException('INVALID_EMAIL_VERIFICATION_REQUEST', 400);
      }
      try {
        const result = await confirmEmailVerification(email, code);
        res.status(200).json(result);
      } catch (error) {
        next(toApiException(error, 'Código inválido ou expirado.'));
      }
    } catch (error) {
      next(error);
    }
  }

  static async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await Users.findByPk(Number(req.userId), {
        attributes: ['id_user', 'email'],
      });
      if (!user) {
        throw new ApiException('USER_NOT_FOUND', 404);
      }
      try {
        let result = await getEmailVerificationStatus(user.email);
        if (result.verified && result.userId === null) {
          await associateVerifiedEmail(user.email, user.id_user);
          result = { verified: true, userId: user.id_user };
        }
        res.status(200).json(result);
      } catch (error) {
        next(toApiException(error, 'Não foi possível consultar a confirmação do e-mail.'));
      }
    } catch (error) {
      next(error);
    }
  }

  static async requestEmailChange(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body as { email?: unknown };
      if (typeof email !== 'string') {
        throw new ApiException('INVALID_EMAIL_CHANGE_REQUEST', 400);
      }
      const user = await Users.findByPk(Number(req.userId), {
        attributes: ['id_user', 'email'],
      });
      if (!user) {
        throw new ApiException('USER_NOT_FOUND', 404);
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === user.email.trim().toLowerCase()) {
        throw new ApiException('EMAIL_CHANGE_UNCHANGED', 400);
      }
      const existingUser = await Users.findOne({
        where: { email: normalizedEmail },
        attributes: ['id_user'],
      });
      if (existingUser) {
        throw new ApiException('EMAIL_CHANGE_ALREADY_IN_USE', 409);
      }
      try {
        const result = await requestEmailVerification(normalizedEmail, user.id_user, true);
        res.status(202).json(result);
      } catch (error) {
        next(toApiException(error, 'Não foi possível solicitar o código.'));
      }
    } catch (error) {
      next(error);
    }
  }

  static async confirmEmailChange(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, code } = req.body as { email?: unknown; code?: unknown };
      if (typeof email !== 'string' || typeof code !== 'string') {
        throw new ApiException('INVALID_EMAIL_CHANGE_CONFIRMATION', 400);
      }
      const userId = Number(req.userId);
      let verification;
      try {
        await confirmEmailVerification(email, code);
        verification = await getEmailVerificationStatus(email);
      } catch (error) {
        next(toApiException(error, 'Não foi possível alterar o e-mail.'));
        return;
      }
      if (verification.userId !== userId) {
        throw new ApiException('EMAIL_CHANGE_VERIFICATION_NOT_OWNED', 403);
      }
      const normalizedEmail = email.trim().toLowerCase();
      await UserService.updateEmail(userId, normalizedEmail);
      res.status(200).json({ verified: true, email: normalizedEmail });
    } catch (error) {
      next(error);
    }
  }
}

export default EmailVerificationController;
