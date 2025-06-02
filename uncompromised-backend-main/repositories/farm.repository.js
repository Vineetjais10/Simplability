const { Farm } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const index = async function (limit, offset) {
  const farms = await Farm.findAndCountAll({
    attributes: { exclude: ['deleted_at'] },
    limit,
    offset,
    order: [['name', 'ASC']]
  });
  return farms;
};

const findByName = async function (name, transaction) {
  const farm = await Farm.findOne({ where: { name }, transaction });
  return farm;
};

const create = async function (farmData, transaction) {
  try {
    const farm = await Farm.create(farmData, { transaction: transaction });
    return farm;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const view = async function (id) {
  const farm = await Farm.findByPk(id, {
    attributes: { exclude: ['deleted_at'] }
  });
  return farm;
};

const remove = async function (id, transaction) {
  const removedRow = await Farm.destroy({ where: { id } }, { transaction });
  return !(removedRow === 0);
};

const update = async function (id, payload, transaction) {
  try {
    await Farm.update(payload, { where: { id: id } }, { transaction });
    return module.exports.view(id);
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findOrCreateFarm = async function (name, payload, transaction) {
  try {
    let updatedFarm;
    const [farm, isCreated] = await Farm.findOrCreate({
      where: { name },
      defaults: payload,
      transaction
    });

    if (!isCreated) {
      if (payload.name) {
        delete payload.name;
      }

      updatedFarm = await Farm.update(payload, { where: { id: farm.id }, returning: true, transaction });
      updatedFarm = updatedFarm[1]?.pop();
    }

    return { farm: updatedFarm ? updatedFarm : farm, oldFarm: farm, isCreated };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const getAll = async function () {
  const farms = await Farm.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  });
  return farms;
};

module.exports = {
  index,
  create,
  view,
  remove,
  update,
  findByName,
  findOrCreateFarm,
  getAll
};
