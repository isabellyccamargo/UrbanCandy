import { type NextFunction, type Request, type Response } from 'express';
import AdminService from '../service/AdminService.js';
import { ApiException } from '../exception/ApiException.js';

function parsePathId(value: string | string[] | undefined, field: string): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new ApiException('INVALID_ID', 400, field);
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new ApiException('INVALID_ID', 400, field);
  }
  return id;
}

function parsePageValue(value: unknown, field: string, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new ApiException('INVALID_PAGINATION', 400, field);
  }

  const number = Number(value);
  if (!Number.isSafeInteger(number) || (field === 'size' && number > 100)) {
    throw new ApiException('INVALID_PAGINATION', 400, field);
  }
  return number;
}

class AdminController {
  static async findUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parsePageValue(req.query.page, 'page', 1);
      const size = parsePageValue(req.query.size, 'size', 10);
      const role = req.query.role;
      if (
        role !== undefined &&
        (typeof role !== 'string' || !['all', 'customer', 'employee', 'manager'].includes(role))
      ) {
        throw new ApiException('INVALID_REQUEST_BODY', 400, 'role');
      }
      if (!Number.isSafeInteger((page - 1) * size)) {
        throw new ApiException('INVALID_PAGINATION', 400, 'page');
      }
      const result = await AdminService.findUsers(page, size, role as string | undefined);

      res.status(200).json({
        totalItems: result.count,
        totalPages: Math.ceil(result.count / size),
        currentPage: page,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await AdminService.findRoles());
    } catch (error) {
      next(error);
    }
  }

  static async findPermissions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await AdminService.findPermissions());
    } catch (error) {
      next(error);
    }
  }

  static async replaceUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id_user = parsePathId(req.params.id_user, 'id_user');
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new ApiException('INVALID_REQUEST_BODY', 400);
      }
      if (Object.keys(req.body).length !== 1 || !Object.hasOwn(req.body, 'id_roles')) {
        throw new ApiException('INVALID_REQUEST_BODY', 400);
      }

      const result = await AdminService.replaceUserRoles(id_user, req.userId!, req.body.id_roles);
      res.status(200).json({ message: 'Papéis do usuário atualizados com sucesso', ...result });
    } catch (error) {
      next(error);
    }
  }

  static async replaceRolePermissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id_role = parsePathId(req.params.id_role, 'id_role');
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        throw new ApiException('INVALID_REQUEST_BODY', 400);
      }
      if (Object.keys(req.body).length !== 1 || !Object.hasOwn(req.body, 'id_permissions')) {
        throw new ApiException('INVALID_REQUEST_BODY', 400);
      }

      const result = await AdminService.replaceRolePermissions(id_role, req.body.id_permissions);
      res.status(200).json({ message: 'Permissões do papel atualizadas com sucesso', ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
