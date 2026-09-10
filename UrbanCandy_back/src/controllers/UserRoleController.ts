import { type Request, type Response, type NextFunction } from 'express';

import UserRoleService from '../service/UserRoleService.js';
import { ApiException } from '../exception/ApiException.js';

class UserRoleController {
  static async findAllUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, size } = req.query;

      const pageNumber = Number(page) || 1;

      const sizeNumber = Number(size) || 10;

      const result = await UserRoleService.findAllUserRoles(pageNumber, sizeNumber);

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

  static async findByIdUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_user_role } = req.params;

      if (!id_user_role || Array.isArray(id_user_role)) {
        throw new ApiException('INVALID_ID', 400, 'id_user_role');
      }

      const id = Number(id_user_role);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_user_role);
      }

      const userRole = await UserRoleService.findByIdUserRole(id);

      res.status(200).json(userRole);
    } catch (error) {
      next(error);
    }
  }

  static async findByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_user } = req.params;

      if (!id_user || Array.isArray(id_user)) {
        throw new ApiException('INVALID_ID', 400, 'id_user');
      }

      const id = Number(id_user);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_user);
      }

      const userRoles = await UserRoleService.findByUser(id);

      res.status(200).json(userRoles);
    } catch (error) {
      next(error);
    }
  }

  static async findByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_role } = req.params;

      if (!id_role || Array.isArray(id_role)) {
        throw new ApiException('INVALID_ID', 400, 'id_role');
      }

      const id = Number(id_role);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_role);
      }

      const userRoles = await UserRoleService.findByRole(id);

      res.status(200).json(userRoles);
    } catch (error) {
      next(error);
    }
  }

  static async createUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_user, id_role } = req.body;

      if (!id_user || !id_role) {
        throw new ApiException('REQUIRED_FIELD', 400, 'id_user/id_role');
      }

      const userRole = await UserRoleService.createUserRole(Number(id_user), Number(id_role));

      res.status(201).json({
        message: 'Role atribuído ao usuário com sucesso',
        id_user_role: userRole.id_user_role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_user_role } = req.params;

      if (!id_user_role || Array.isArray(id_user_role)) {
        throw new ApiException('INVALID_ID', 400, 'id_user_role');
      }

      const id = Number(id_user_role);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_user_role);
      }

      await UserRoleService.deleteUserRole(id);

      res.status(200).json({
        message: 'Role removido do usuário com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserRoleController;
