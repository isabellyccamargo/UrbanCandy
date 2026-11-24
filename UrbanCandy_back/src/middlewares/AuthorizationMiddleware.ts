import { type NextFunction, type Request } from 'express';
import Users from '../models/Users.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { ApiException } from '../exception/ApiException.js';

// Recebe o nome da permissão necessária (ex: 'cadastrar_produto') e devolve um middleware do Express para validar o acesso dinamicamente em cada rota.
export function authorizePermission(permissionName: string) {
  return async (req: Request, _res: unknown, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next(new ApiException('AUTH_REQUIRED', 401));
      }

      const user = await Users.findByPk(req.userId, {
        include: [
          {
            model: Role,
            as: 'roles',
            include: [
              {
                model: Permission,
                as: 'permissions',
              },
            ],
          },
        ],
      });

      if (!user) {
        return next(new ApiException('USER_NOT_FOUND', 404));
      }

      // Consolida todas as permissões do usuário em um único array de strings
      const userPermissions =
        user.roles?.flatMap(
          (role) => role.permissions?.map((permission) => permission.name) ?? []
        ) ?? [];

      if (!userPermissions.includes(permissionName)) {
        return next(new ApiException('FORBIDDEN', 403));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
