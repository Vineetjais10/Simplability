const { FarmCrop } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const create = async function ({ farmId, cropId }, transaction) {
  try {
    const farmCrop = await FarmCrop.create(
      {
        farm_id: farmId,
        crop_id: cropId
      },
      { transaction }
    );

    return farmCrop;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findOrCreate = async function ({ farmId, cropId }, transaction) {
  try {
    const [farmCrop, isCreated] = await FarmCrop.findOrCreate({
      where: { farm_id: farmId, crop_id: cropId },
      defaults: { farm_id: farmId, crop_id: cropId },
      transaction
    });
    return { farmCrop, isCreated };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const findByFarmId = async function (id) {
  const farmCrops = await FarmCrop.findAll({ where: { farm_id: id } });
  return farmCrops;
};

const findByCropId = async function (id) {
  const farmCrops = await FarmCrop.findAll({ where: { crop_id: id } });
  return farmCrops;
};

const destroy = async function (id, transaction) {
  const removedRow = await FarmCrop.destroy({ where: { id }, force: true }, { transaction });
  return !(removedRow === 0);
};

module.exports = {
  create,
  findByFarmId,
  findByCropId,
  findOrCreate,
  destroy
};
