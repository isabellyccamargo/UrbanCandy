import {
    type Request,
    type Response,
    type NextFunction,
} from 'express';

import RolePermissionService from '../service/RolePermissionService.js';
import { ApiException } from '../exception/ApiException.js';

class RolePermissionController {
    static async findAllRolePermissions(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { page, size } = req.query;

            const pageNumber =
                Number(page) || 1;

            const sizeNumber =
                Number(size) || 10;

            const result =
                await RolePermissionService.findAllRolePermissions(
                    pageNumber,
                    sizeNumber
                );

            res.status(200).json({
                totalItems: result.count,
                totalPages: Math.ceil(
                    result.count / sizeNumber
                ),
                currentPage: pageNumber,
                data: result.rows,
            });
        } catch (error) {
            next(error);
        }
    }

    static async findByIdRolePermission(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id_role_permission } = req.params;

            if (
                !id_role_permission ||
                Array.isArray(id_role_permission)
            ) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    'id_role_permission'
                );
            }

            const id = Number(id_role_permission);

            if (Number.isNaN(id)) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    id_role_permission
                );
            }

            const rolePermission =
                await RolePermissionService.findByIdRolePermission(
                    id
                );

            res.status(200).json(rolePermission);
        } catch (error) {
            next(error);
        }
    }

    static async findByRole(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id_role } = req.params;

            if (
                !id_role ||
                Array.isArray(id_role)
            ) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    'id_role'
                );
            }

            const id = Number(id_role);

            if (Number.isNaN(id)) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    id_role
                );
            }

            const permissions =
                await RolePermissionService.findByRole(id);

            res.status(200).json(permissions);
        } catch (error) {
            next(error);
        }
    }

    static async findByPermission(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id_permission } = req.params;

            if (
                !id_permission ||
                Array.isArray(id_permission)
            ) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    'id_permission'
                );
            }

            const id = Number(id_permission);

            if (Number.isNaN(id)) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    id_permission
                );
            }

            const roles =
                await RolePermissionService.findByPermission(
                    id
                );

            res.status(200).json(roles);
        } catch (error) {
            next(error);
        }
    }

    static async createRolePermission(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                id_role,
                id_permission,
            } = req.body;

            if (!id_role || !id_permission) {
                throw new ApiException(
                    'REQUIRED_FIELD',
                    400,
                    'id_role/id_permission'
                );
            }

            const rolePermission =
                await RolePermissionService.createRolePermission(
                    Number(id_role),
                    Number(id_permission)
                );

            res.status(201).json({
                message:
                    'Permissão atribuída ao role com sucesso',
                id_role_permission:
                    rolePermission.id_role_permission,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteRolePermission(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id_role_permission } = req.params;

            if (
                !id_role_permission ||
                Array.isArray(id_role_permission)
            ) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    'id_role_permission'
                );
            }

            const id = Number(id_role_permission);

            if (Number.isNaN(id)) {
                throw new ApiException(
                    'INVALID_ID',
                    400,
                    id_role_permission
                );
            }

            await RolePermissionService.deleteRolePermission(
                id
            );

            res.status(200).json({
                message:
                    'Permissão removida do role com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default RolePermissionController;