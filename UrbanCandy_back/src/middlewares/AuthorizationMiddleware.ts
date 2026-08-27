import {
    type NextFunction,
    type Request,
    type Response,
} from 'express';

import Users from '../models/Users.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

export function authorizePermission(permissionName: string) {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    message: 'Usuário não autenticado',
                });
            }

            const user = await Users.findByPk(
                req.userId,
                {
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            include: [
                                {
                                    model: Permission,
                                    as: 'permissions',
                                    where: {
                                        name: permissionName,
                                    },
                                    required: false,
                                },
                            ],
                        },
                    ],
                }
            );

            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado',
                });
            }

            const hasPermission = user.roles?.some(
                (role) =>
                    role.permissions &&
                    role.permissions.length > 0
            );

            if (!hasPermission) {
                return res.status(403).json({
                    message:
                        'Você não possui permissão para realizar esta ação',
                });
            }

            return next();
        } catch (error) {
            console.error(
                'Erro ao verificar permissão:',
                error
            );

            return res.status(500).json({
                message:
                    'Erro ao verificar permissão do usuário',
            });
        }
    };
}