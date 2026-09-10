import Permission from '../models/Permission.js';

class PermissionRepository {
  async findAllPermissions(limit: number, offset: number) {
    return await Permission.findAndCountAll({
      limit,
      offset,
      order: [['id_permission', 'ASC']],
    });
  }

  async findByIdPermission(id_permission: number) {
    return await Permission.findByPk(id_permission);
  }

  async findByName(name: string) {
    return await Permission.findOne({
      where: { name },
    });
  }

  async createPermission(permissionData: Partial<Permission>) {
    return await Permission.create(permissionData);
  }

  async updatePermission(id_permission: number, permissionData: Partial<Permission>) {
    return await Permission.update(permissionData, {
      where: { id_permission },
    });
  }

  async deletePermission(id_permission: number) {
    return await Permission.destroy({
      where: { id_permission },
    });
  }
}

export default new PermissionRepository();
