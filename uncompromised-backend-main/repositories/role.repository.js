const { Role, Permission } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const repoIndex = async function (attributes) {
  const roles = await Role.findAll({
    attributes: attributes ? attributes : { exclude: ['deleted_at'] }
  });
  return roles;
};

const create = async function ({ name }, transaction) {
  try {
    const role = await Role.create(
      {
        name: name
      },
      {
        transaction
      }
    );
    return role;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const update = async function (id, { name }, trnxContext) {
  try {
    const [updatedRow] = await Role.update(
      {
        name: name
      },
      {
        where: { id }
      },
      {
        trnxContext
      }
    );
    return !(updatedRow === 0);
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const remove = async function (id, trnxContext) {
  const removedRow = await Role.destroy({ where: { id } }, { trnxContext });
  return !(removedRow === 0);
};

const findByIds = async function (ids) {
  const roles = await Role.findAll({ where: { id: ids } });
  return roles;
};

const findByName = async function (name) {
  const role = await Role.findOne({ where: { name } });
  return role;
};

const view = async function (id) {
  const role = await Role.findByPk(id);
  return role;
};

const findByIdWithRoles = async function (id) {
  const role = await Role.findByPk(id, {
    include: [
      {
        model: Permission,
        through: { attributes: [] }
      }
    ]
  });
  return role;
};

const indexWithRoles = async function () {
  const roles = await Role.findAll({
    include: [
      {
        model: Permission,
        through: { attributes: [] }
      }
    ]
  });
  return roles;
};

const findOrCreateRole = async function (name, transaction) {
  try {
    const [role] = await Role.findOrCreate({
      where: { name },
      defaults: { name },
      transaction
    });
    return role;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

module.exports = {
  repoIndex,
  create,
  remove,
  update,
  findByIds,
  findByName,
  view,
  findByIdWithRoles,
  indexWithRoles,
  findOrCreateRole
};
