import RoleRepository from '../repositories/RoleRepository.js';
import Role from '../models/Role.js';
import { ApiException } from '../exception/ApiException.js';

class RoleService {
    async findAllRoles(
        page: number = 1,
        size: number = 10
    ) {
        const limit = size;
        const offset = (page - 1) * size;

        return await RoleRepository.findAllRoles(
            limit,
            offset
        );
    }

    async findByIdRole(id_role: number) {
        const role = await RoleRepository.findByIdRole(id_role);

        if (!role) {
            throw new ApiException(
                'ROLE_NOT_FOUND',
                404
            );
        }

        return role;
    }

    async createRole(
        roleData: {
            name: string;
            description?: string;
        }
    ): Promise<Role> {
        if (!roleData.name?.trim()) {
            throw new ApiException(
                'REQUIRED_FIELD',
                400,
                'name'
            );
        }

        const roleExists =
            await RoleRepository.findByName(
                roleData.name.trim()
            );

        if (roleExists) {
            throw new ApiException(
                'ROLE_ALREADY_EXISTS',
                409,
                roleData.name
            );
        }

        return await RoleRepository.createRole({
            name: roleData.name.trim(),
            description:
                roleData.description?.trim() || null,
        });
    }

    async updateRole(
        id_role: number,
        roleData: {
            name?: string;
            description?: string;
        }
    ) {
        const role =
            await RoleRepository.findByIdRole(id_role);

        if (!role) {
            throw new ApiException(
                'ROLE_NOT_FOUND',
                404
            );
        }

        if (roleData.name) {
            const roleExists =
                await RoleRepository.findByName(
                    roleData.name.trim()
                );

            if (
                roleExists &&
                roleExists.id_role !== id_role
            ) {
                throw new ApiException(
                    'ROLE_ALREADY_EXISTS',
                    409,
                    roleData.name
                );
            }

            roleData.name = roleData.name.trim();
        }

        if (roleData.description) {
            roleData.description =
                roleData.description.trim();
        }

        await RoleRepository.updateRole(
            id_role,
            roleData
        );

        return await RoleRepository.findByIdRole(
            id_role
        );
    }

    async deleteRole(id_role: number) {
        const role =
            await RoleRepository.findByIdRole(id_role);

        if (!role) {
            throw new ApiException(
                'ROLE_NOT_FOUND',
                404
            );
        }

        await RoleRepository.deleteRole(id_role);
    }
}

export default new RoleService();