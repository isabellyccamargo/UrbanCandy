import { Op, type IncludeOptions, type WhereOptions } from 'sequelize';
import sequelize from '../config/Config.js';
import Users from '../models/Users.js';
import People from '../models/People.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import UserRole from '../models/UserRole.js';
import RolePermission from '../models/RolePermission.js';
import { ApiException } from '../exception/ApiException.js';
import { isEmployeeRoleName, isManagerRoleName, parseIdList } from '../utils/AdminAccess.js';

class AdminService {
  async findUsers(page: number, size: number, roleFilter = 'all') {
    let userWhere: WhereOptions = {};
    const roleInclude: IncludeOptions = {
      model: Role,
      as: 'roles',
      attributes: ['id_role', 'name'],
      through: { attributes: [] },
    };

    if (roleFilter === 'customer' || roleFilter === 'manager' || roleFilter === 'employee') {
      const availableRoles = await Role.findAll({ attributes: ['id_role', 'name'] });
      const matchingRoleIds = availableRoles
        .filter((role) => {
          if (roleFilter === 'customer') {
            return isManagerRoleName(role.name) || isEmployeeRoleName(role.name);
          }
          return roleFilter === 'manager'
            ? isManagerRoleName(role.name)
            : isEmployeeRoleName(role.name);
        })
        .map((role) => role.id_role);

      if (matchingRoleIds.length) {
        const assignedUsers = await UserRole.findAll({
          attributes: ['id_user'],
          where: { id_role: { [Op.in]: matchingRoleIds } },
        });
        const matchingUserIds = [...new Set(assignedUsers.map((assignment) => assignment.id_user))];

        if (roleFilter === 'customer') {
          if (matchingUserIds.length) userWhere = { id_user: { [Op.notIn]: matchingUserIds } };
        } else {
          if (!matchingUserIds.length) return { count: 0, rows: [] };
          userWhere = { id_user: { [Op.in]: matchingUserIds } };
        }
      } else if (roleFilter !== 'customer') {
        return { count: 0, rows: [] };
      }
    }

    return Users.findAndCountAll({
      attributes: ['id_user', 'email'],
      where: userWhere,
      include: [
        {
          model: People,
          as: 'people',
          attributes: ['id_people', 'name', 'cpf', 'telephone'],
        },
        roleInclude,
      ],
      distinct: true,
      limit: size,
      offset: (page - 1) * size,
      order: [['id_user', 'ASC']],
    });
  }

  async findRoles() {
    return Role.findAll({
      attributes: ['id_role', 'name', 'description'],
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id_permission', 'name', 'description'],
          through: { attributes: [] },
        },
      ],
      order: [['id_role', 'ASC']],
    });
  }

  async findPermissions() {
    return Permission.findAll({
      attributes: ['id_permission', 'name', 'description'],
      order: [['id_permission', 'ASC']],
    });
  }

  async replaceUserRoles(id_user: number, actorId: number, value: unknown) {
    const id_roles = parseIdList(value, 'id_roles');

    return sequelize.transaction(async (transaction) => {
      const user = await Users.findByPk(id_user, { transaction, lock: transaction.LOCK.UPDATE });
      if (!user) {
        throw new ApiException('USER_NOT_FOUND', 404, id_user);
      }

      const roles = await Role.findAll({
        attributes: ['id_role', 'name'],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const roleIds = new Set(roles.map((role) => role.id_role));
      if (id_roles.some((id) => !roleIds.has(id))) {
        throw new ApiException('ROLE_NOT_FOUND', 404);
      }

      if (id_user === actorId) {
        const managerRoleIds = roles
          .filter((role) => isManagerRoleName(role.name))
          .map((role) => role.id_role);

        if (managerRoleIds.length === 0) {
          throw new ApiException('FORBIDDEN', 403);
        }

        const currentManagerAssignments = await UserRole.findAll({
          where: { id_role: { [Op.in]: managerRoleIds } },
          attributes: ['id_user', 'id_role'],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        const actorIsStillManager = currentManagerAssignments.some(
          (assignment) => assignment.id_user === actorId
        );
        if (!actorIsStillManager || !id_roles.some((id) => managerRoleIds.includes(id))) {
          throw new ApiException('FORBIDDEN', 403);
        }
      }

      await UserRole.destroy({ where: { id_user }, transaction });
      if (id_roles.length > 0) {
        await UserRole.bulkCreate(
          id_roles.map((id_role) => ({ id_user, id_role })),
          { transaction }
        );
      }

      return { id_user, id_roles };
    });
  }

  async replaceRolePermissions(id_role: number, value: unknown) {
    const id_permissions = parseIdList(value, 'id_permissions');

    return sequelize.transaction(async (transaction) => {
      const role = await Role.findByPk(id_role, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!role) {
        throw new ApiException('ROLE_NOT_FOUND', 404, id_role);
      }

      if (id_permissions.length > 0) {
        const permissions = await Permission.findAll({
          where: { id_permission: { [Op.in]: id_permissions } },
          attributes: ['id_permission'],
          transaction,
        });
        if (permissions.length !== id_permissions.length) {
          throw new ApiException('PERMISSION_NOT_FOUND', 404);
        }
      }

      await RolePermission.destroy({ where: { id_role }, transaction });
      if (id_permissions.length > 0) {
        await RolePermission.bulkCreate(
          id_permissions.map((id_permission) => ({ id_role, id_permission })),
          { transaction }
        );
      }

      return { id_role, id_permissions };
    });
  }
}

export default new AdminService();
