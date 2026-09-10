import PermissionRepository from '../repositories/PermissionRepository.js';
import Permission from '../models/Permission.js';
import { ApiException } from '../exception/ApiException.js';

class PermissionService {
  async findAllPermissions(page: number = 1, size: number = 10) {
    const limit = size;
    const offset = (page - 1) * size;

    return await PermissionRepository.findAllPermissions(limit, offset);
  }

  async findByIdPermission(id_permission: number) {
    const permission = await PermissionRepository.findByIdPermission(id_permission);

    if (!permission) {
      throw new ApiException('PERMISSION_NOT_FOUND', 404);
    }

    return permission;
  }

  async createPermission(permissionData: {
    name: string;
    description?: string;
  }): Promise<Permission> {
    if (!permissionData.name?.trim()) {
      throw new ApiException('REQUIRED_FIELD', 400, 'name');
    }

    const permissionExists = await PermissionRepository.findByName(permissionData.name.trim());

    if (permissionExists) {
      throw new ApiException('PERMISSION_ALREADY_EXISTS', 409, permissionData.name);
    }

    return await PermissionRepository.createPermission({
      name: permissionData.name.trim(),
      description: permissionData.description?.trim() || null,
    });
  }

  async updatePermission(
    id_permission: number,
    permissionData: {
      name?: string;
      description?: string;
    }
  ) {
    const permission = await PermissionRepository.findByIdPermission(id_permission);

    if (!permission) {
      throw new ApiException('PERMISSION_NOT_FOUND', 404);
    }

    if (permissionData.name) {
      const permissionExists = await PermissionRepository.findByName(permissionData.name.trim());

      if (permissionExists && permissionExists.id_permission !== id_permission) {
        throw new ApiException('PERMISSION_ALREADY_EXISTS', 409, permissionData.name);
      }

      permissionData.name = permissionData.name.trim();
    }

    if (permissionData.description) {
      permissionData.description = permissionData.description.trim();
    }

    await PermissionRepository.updatePermission(id_permission, permissionData);

    return await PermissionRepository.findByIdPermission(id_permission);
  }

  async deletePermission(id_permission: number) {
    const permission = await PermissionRepository.findByIdPermission(id_permission);

    if (!permission) {
      throw new ApiException('PERMISSION_NOT_FOUND', 404);
    }

    await PermissionRepository.deletePermission(id_permission);
  }
}

export default new PermissionService();
