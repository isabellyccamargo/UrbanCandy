import Role from '../models/Role.js';

class RoleRepository {
    async findAllRoles(limit: number, offset: number) {
        return await Role.findAndCountAll({
            limit,
            offset,
            order: [['id_role', 'ASC']],
        });
    }

    async findByIdRole(id_role: number) {
        return await Role.findByPk(id_role);
    }

    async findByName(name: string) {
        return await Role.findOne({
            where: { name },
        });
    }

    async createRole(roleData: Partial<Role>) {
        return await Role.create(roleData);
    }

    async updateRole(
        id_role: number,
        roleData: Partial<Role>
    ) {
        return await Role.update(
            roleData,
            {
                where: { id_role },
            }
        );
    }

    async deleteRole(id_role: number) {
        return await Role.destroy({
            where: { id_role },
        });
    }
}

export default new RoleRepository();