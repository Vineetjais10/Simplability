const { sequelize } = require('../../models');
const roleRepo = require('../../repositories/role.repository');
const rolePermissionRepo = require('../../repositories/role-permission.repository');
const create = async function (payload) {
  const transactionContext = await sequelize.transaction();
  try {
    // create role
    const role = await roleRepo.create({ name: payload.name.trim() }, transactionContext);
    // create role permission
    for (let i = 0; i < payload.permission_ids.length; i++) {
      const permissionId = payload.permission_ids[i];
      await rolePermissionRepo.create({ roleId: role.id, permissionId: permissionId }, transactionContext);
    }
    await transactionContext.commit();
    return role;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const update = async function (id, payload) {
  const transactionContext = await sequelize.transaction();
  try {
    const isUpdated = await roleRepo.update(id, payload, transactionContext);
    //get all role permissions
    const rolePermissions = await rolePermissionRepo.findByRoleId(id);
    for (const rolePermission of rolePermissions) {
      //force delete role permissions
      await rolePermissionRepo.destroy(rolePermission.id, transactionContext);
    }

    for (let i = 0; i < payload.permission_ids.length; i++) {
      const permissionId = payload.permission_ids[i];
      // create role permissions
      await rolePermissionRepo.create({ roleId: id, permissionId: permissionId }, transactionContext);
    }
    await transactionContext.commit();
    return isUpdated;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

module.exports = {
  create,
  update
};
