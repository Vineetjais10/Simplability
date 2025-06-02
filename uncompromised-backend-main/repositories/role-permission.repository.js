const { RolePermission } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const findByRoleId = async function (id) {
  const rolePermissions = await RolePermission.findAll({ where: { role_id: id } });
  return rolePermissions;
};

const create = async function ({ roleId, permissionId }, transaction) {
  try {
    const rolePermission = await RolePermission.create(
      {
        role_id: roleId,
        permission_id: permissionId
      },
      { transaction }
    );

    return rolePermission;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findOrCreateRolePermission = async function (payload, transaction) {
  try {
    const [rolePermission] = await RolePermission.findOrCreate({
      where: { role_id: payload.roleId, permission_id: payload.permissionId },
      defaults: payload,
      transaction
    });
    return rolePermission;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const remove = async function (id, trnxContext) {
  const removedRow = await RolePermission.destroy({ where: { id } }, { trnxContext });
  return !(removedRow === 0);
};

const destroy = async function (id, trnxContext) {
  const removedRow = await RolePermission.destroy({ where: { id }, force: true }, { trnxContext });
  return !(removedRow === 0);
};

module.exports = {
  findByRoleId,
  create,
  findOrCreateRolePermission,
  remove,
  destroy
};
