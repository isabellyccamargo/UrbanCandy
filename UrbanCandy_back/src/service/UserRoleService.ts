import UserRoleRepository from '../repositories/UserRoleRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import RoleRepository from '../repositories/RoleRepository.js';
import UserRole from '../models/UserRole.js';
import { ApiException } from '../exception/ApiException.js';

class UserRoleService {
  async findAllUserRoles(page: number = 1, size: number = 10) {
    const limit = size;
    const offset = (page - 1) * size;

    return await UserRoleRepository.findAllUserRoles(limit, offset);
  }

  async findByIdUserRole(id_user_role: number) {
    const userRole = await UserRoleRepository.findByIdUserRole(id_user_role);

    if (!userRole) {
      throw new ApiException('USER_ROLE_NOT_FOUND', 404);
    }

    return userRole;
  }

  async findByUser(id_user: number) {
    return await UserRoleRepository.findByUser(id_user);
  }

  async findByRole(id_role: number) {
    return await UserRoleRepository.findByRole(id_role);
  }

  async createUserRole(id_user: number, id_role: number): Promise<UserRole> {
    const user = await UserRepository.findByIdUser(id_user);

    if (!user) {
      throw new ApiException('USER_NOT_FOUND', 404, id_user);
    }

    const role = await RoleRepository.findByIdRole(id_role);

    if (!role) {
      throw new ApiException('ROLE_NOT_FOUND', 404, id_role);
    }

    const userRoleExists = await UserRoleRepository.findByUserAndRole(id_user, id_role);

    if (userRoleExists) {
      throw new ApiException('USER_ALREADY_HAS_ROLE', 409);
    }

    return await UserRoleRepository.createUserRole({
      id_user,
      id_role,
    });
  }

  async deleteUserRole(id_user_role: number) {
    const userRole = await UserRoleRepository.findByIdUserRole(id_user_role);

    if (!userRole) {
      throw new ApiException('USER_ROLE_NOT_FOUND', 404);
    }

    await UserRoleRepository.deleteUserRole(id_user_role);
  }
}

export default new UserRoleService();
