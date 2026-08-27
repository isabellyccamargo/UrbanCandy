import {
    type Request,
    type Response,
    type NextFunction,
} from 'express';

import PermissionService from '../service/PermissionService.js';
import { ApiException } from '../exception/ApiException.js';

class PermissionController {
    static async findAllPermissions(
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
                await PermissionService.findAllPermissions(
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

    static async findByIdPermission(
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

            const permission =
                await PermissionService.findByIdPermission(id);

            res.status(200).json(permission);
        } catch (error) {
            next(error);
        }
    }

    static async createPermission(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const permission =
                await PermissionService.createPermission(
                    req.body
                );

            res.status(201).json({
                message: 'Permissão criada com sucesso',
                id_permission: permission.id_permission,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updatePermission(
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

            const permission =
                await PermissionService.updatePermission(
                    id,
                    req.body
                );

            res.status(200).json({
                message: 'Permissão atualizada com sucesso',
                data: permission,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deletePermission(
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

            await PermissionService.deletePermission(id);

            res.status(200).json({
                message: 'Permissão excluída com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default PermissionController;