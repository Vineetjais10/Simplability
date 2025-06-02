const { Crop } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const index = async function () {
  const crops = await Crop.findAll({
    attributes: { exclude: ['deleted_at'] },
    order: [['name', 'ASC']]
  });
  return crops;
};

const create = async function ({ name }, transaction) {
  try {
    const crop = await Crop.create(
      {
        name: name
      },
      {
        transaction
      }
    );
    return crop;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const update = async function (id, payload, trnxContext) {
  try {
    await Crop.update(payload, { where: { id: id }, trnxContext });
    return module.exports.view(id);
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const remove = async function (id, trnxContext) {
  const removedRow = await Crop.destroy({ where: { id } }, { trnxContext });
  return !(removedRow === 0);
};

const findByName = async function (name, transaction) {
  const crop = await Crop.findOne({ where: { name }, transaction });
  return crop;
};

const view = async function (id) {
  const crop = await Crop.findByPk(id);
  return crop;
};

const findByIds = async function (ids) {
  const crops = await Crop.findAll({ where: { id: ids } });
  return crops;
};

const findOrCreateCrop = async function (name, paylod, transaction) {
  try {
    const [crop, isCreated] = await Crop.findOrCreate({
      where: { name },
      defaults: paylod,
      transaction
    });
    return { crop, isCreated };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const getAll = async function () {
  const crops = await Crop.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  });
  return crops;
};

module.exports = {
  index,
  create,
  remove,
  update,
  findByName,
  view,
  findByIds,
  findOrCreateCrop,
  getAll
};
