const { Permission } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const index = async function () {
  const permissions = await Permission.findAll({
    attributes: { exclude: ['deleted_at'] }
  });
  return permissions;
};

const create = async function ({ resource, action }, trnxContext) {
  try {
    const permission = await Permission.create(
      {
        resource: resource,
        action: action
      },
      {
        trnxContext
      }
    );
    return permission;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const update = async function (id, { resource, action }, trnxContext) {
  try {
    const [updatedRow] = await Permission.update(
      {
        resource: resource,
        action: action
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
  const removedRow = await Permission.destroy({ where: { id } }, { trnxContext });
  return !(removedRow === 0);
};

const findByIds = async function (ids) {
  const permissions = await Permission.findAll({ where: { id: ids } });
  return permissions;
};

const findByName = async function (name) {
  const permission = await Permission.findOne({ where: { name } });
  return permission;
};

const view = async function (id) {
  const permission = await Permission.findByPk(id);
  return permission;
};

const findOrCreatePermission = async function (payload, transaction) {
  try {
    const [permission] = await Permission.findOrCreate({
      where: { resource: payload.resource, action: payload.action },
      defaults: payload,
      transaction
    });
    return permission;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

module.exports = {
  index,
  create,
  remove,
  update,
  findByIds,
  findByName,
  view,
  findOrCreatePermission
};
