import { type Request, type Response, type NextFunction } from 'express';
import UserService from '../service/UserService.js';
import { ApiException } from '../exception/ApiException.js';
import {
  associateVerifiedEmail,
  getEmailVerificationStatus,
} from '../service/EmailServiceClient.js';
import logger from '../utils/logger.js';

class UserController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ApiException('REQUIRED_FIELD', 400, 'email/password');
      }
      const result = await UserService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, size } = req.query;
      const pageNumber: number = Number(page) || 1;
      const sizeNumber: number = Number(size) || 10;
      const result = await UserService.findAllUsers(pageNumber, sizeNumber);
      res.status(200).json({
        totalItems: result.count,
        totalPages: Math.ceil(result.count / sizeNumber),
        currentPage: pageNumber,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByIdUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_user } = req.params;
      if (!id_user || Array.isArray(id_user)) {
        throw new ApiException('INVALID_ID', 400, 'id_user');
      }

      const id: number = Number(id_user);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_user);
      }

      const user = await UserService.findByIdUser(id);
      if (!user) {
        throw new ApiException('USER_NOT_FOUND', 404, id);
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Captura a imagem gerada pelo Multer salva na pasta uploads
      const imagePath = req.file ? `uploads/${req.file.filename}` : undefined;

      if (typeof req.body.email !== 'string') {
        throw new ApiException('INVALID_EMAIL', 400);
      }
      const email = req.body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiException('INVALID_EMAIL', 400);
      }
      let verification;
      try {
        verification = await getEmailVerificationStatus(email);
      } catch (error) {
        logger.error('[email-verification] Unable to check registration address.', { error });
        throw new ApiException('EMAIL_VERIFICATION_UNAVAILABLE', 503);
      }
      if (!verification.verified || verification.userId !== null) {
        throw new ApiException(
          'EMAIL_NOT_VERIFIED',
          403
        );
      }

      const newUser = await UserService.createUser({
        ...req.body,
        email,
        image: imagePath,
      });

      try {
        await associateVerifiedEmail(newUser.email, newUser.id_user);
      } catch (error) {
        logger.error('[email] Failed to associate the verified address with the new account.', {
          userId: newUser.id_user,
          error,
        });
        throw new ApiException('EMAIL_VERIFICATION_UNAVAILABLE', 503);
      }

      res.status(201).json({
        message: 'Cadastro realizado com e-mail confirmado.',
        id: newUser.id_user,
        emailVerified: true,
        verificationLinked: true,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_user } = req.params;
      if (!id_user || Array.isArray(id_user)) {
        throw new ApiException('INVALID_ID', 400, 'id_user');
      }

      const id: number = Number(id_user);
      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_user);
      }

      const imagePath = req.file ? `uploads/${req.file.filename}` : undefined;
      const personData = {
        ...req.body.personData,
        ...(imagePath && { image: imagePath }),
      };

      await UserService.updateUser(id, req.body.userData, personData);
      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
