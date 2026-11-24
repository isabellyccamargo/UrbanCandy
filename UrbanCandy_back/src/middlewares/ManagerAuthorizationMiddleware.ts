import { type NextFunction, type Request } from 'express';
import Users from '../models/Users.js';
import Role from '../models/Role.js';
import { ApiException } from '../exception/ApiException.js';
import { isManagerRoleName } from '../utils/AdminAccess.js';

export default async function managerAuthorizationMiddleware(
  req: Request,
  _res: unknown,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return next(new ApiException('AUTH_REQUIRED', 401));
    }

    const user = await Users.findByPk(req.userId, {
      attributes: ['id_user'],
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id_role', 'name'],
          through: { attributes: [] },
        },
      ],
    });

    if (!user || !user.roles?.some((role) => isManagerRoleName(role.name))) {
      return next(new ApiException('FORBIDDEN', 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
