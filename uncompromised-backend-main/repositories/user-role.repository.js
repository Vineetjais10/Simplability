const { UserRole } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const create = async function ({ userId, roleId }, transaction) {
  try {
    const userRole = await UserRole.create(
      {
        user_id: userId,
        role_id: roleId
      },
      { transaction }
    );

    return userRole;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findByUserId = async function (id) {
  const userRoles = await UserRole.findAll({ where: { user_id: id } });
  return userRoles;
};
const destroy = async function (id, transaction) {
  const removedRow = await UserRole.destroy({ where: { id }, force: true }, { transaction });
  return !(removedRow === 0);
};

const findOrCreateUserRole = async function (payload, transaction) {
  try {
    const [userRole, isCreated] = await UserRole.findOrCreate({
      where: { user_id: payload.userId, role_id: payload.roleId },
      defaults: {
        user_id: payload.userId,
        role_id: payload.roleId
      },
      transaction
    });
    return { userRole, isCreated };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};
module.exports = {
  create,
  findByUserId,
  destroy,
  findOrCreateUserRole
};
