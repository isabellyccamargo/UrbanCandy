import UserRole from '../models/UserRole.js';

class UserRoleRepository {
    async findAllUserRoles(limit: number, offset: number) {
        return await UserRole.findAndCountAll({
            limit,
            offset,
            order: [['id_user_role', 'ASC']],
        });
    }

    async findByIdUserRole(id_user_role: number) {
        return await UserRole.findByPk(id_user_role);
    }

    async findByUserAndRole(
        id_user: number,
        id_role: number
    ) {
        return await UserRole.findOne({
            where: {
                id_user,
                id_role,
            },
        });
    }

    async findByUser(id_user: number) {
        return await UserRole.findAll({
            where: { id_user },
        });
    }

    async findByRole(id_role: number) {
        return await UserRole.findAll({
            where: { id_role },
        });
    }

    async createUserRole(
        userRoleData: Partial<UserRole>
    ) {
        return await UserRole.create(userRoleData);
    }

    async deleteUserRole(id_user_role: number) {
        return await UserRole.destroy({
            where: { id_user_role },
        });
    }
}

export default new UserRoleRepository();