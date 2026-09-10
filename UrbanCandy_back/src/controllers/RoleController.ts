import { type Request, type Response, type NextFunction } from 'express';

import RoleService from '../service/RoleService.js';
import { ApiException } from '../exception/ApiException.js';

class RoleController {
  static async findAllRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, size } = req.query;

      const pageNumber = Number(page) || 1;

      const sizeNumber = Number(size) || 10;

      const result = await RoleService.findAllRoles(pageNumber, sizeNumber);

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

  static async findByIdRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_role } = req.params;

      if (!id_role || Array.isArray(id_role)) {
        throw new ApiException('INVALID_ID', 400, 'id_role');
      }

      const id = Number(id_role);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_role);
      }

      const role = await RoleService.findByIdRole(id);

      res.status(200).json(role);
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await RoleService.createRole(req.body);

      res.status(201).json({
        message: 'Cargo criado com sucesso',
        id_role: role.id_role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_role } = req.params;

      if (!id_role || Array.isArray(id_role)) {
        throw new ApiException('INVALID_ID', 400, 'id_role');
      }

      const id = Number(id_role);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_role);
      }

      const role = await RoleService.updateRole(id, req.body);

      res.status(200).json({
        message: 'Cargo atualizado com sucesso',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id_role } = req.params;

      if (!id_role || Array.isArray(id_role)) {
        throw new ApiException('INVALID_ID', 400, 'id_role');
      }

      const id = Number(id_role);

      if (Number.isNaN(id)) {
        throw new ApiException('INVALID_ID', 400, id_role);
      }

      await RoleService.deleteRole(id);

      res.status(200).json({
        message: 'Cargo excluído com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RoleController;
