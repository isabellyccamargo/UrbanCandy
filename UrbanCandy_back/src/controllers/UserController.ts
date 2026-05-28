import { type Request, type Response, type NextFunction } from 'express';
import UserService from '../service/UserService.js';
import { ApiException } from '../exception/ApiException.js';

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
      const newUser = await UserService.createUser(req.body);
      res.status(201).json({
        message: 'Cadastro completo (Usuário, Pessoa e Endereço) realizado com sucesso',
        id: newUser.id_user,
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
      await UserService.updateUser(id, req.body.userData, req.body.personData);
      res.status(200).json({
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
