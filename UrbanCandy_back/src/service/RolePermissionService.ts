import RolePermission from '../models/RolePermission.js';

class RolePermissionRepository {
    async findAllRolePermissions(
        limit: number,
        offset: number
    ) {
        return await RolePermission.findAndCountAll({
            limit,
            offset,
            order: [['id_role_permission', 'ASC']],
        });
    }

    async findByIdRolePermission(
        id_role_permission: number
    ) {
        return await RolePermission.findByPk(
            id_role_permission
        );
    }

    async findByRoleAndPermission(
        id_role: number,
        id_permission: number
    ) {
        return await RolePermission.findOne({
            where: {
                id_role,
                id_permission,
            },
        });
    }

    async findByRole(id_role: number) {
        return await RolePermission.findAll({
            where: { id_role },
        });
    }

    async findByPermission(id_permission: number) {
        return await RolePermission.findAll({
            where: { id_permission },
        });
    }

    async createRolePermission(
        rolePermissionData: Partial<RolePermission>
    ) {
        return await RolePermission.create(
            rolePermissionData
        );
    }

    async deleteRolePermission(
        id_role_permission: number
    ) {
        return await RolePermission.destroy({
            where: { id_role_permission },
        });
    }
}

export default new RolePermissionRepository();