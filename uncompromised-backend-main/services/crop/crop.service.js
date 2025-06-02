const { sequelize } = require('../../models');
const cropRepo = require('../../repositories/crop.repository');

const create = async function (payload) {
  const transactionContext = await sequelize.transaction();
  try {
    const crop = await cropRepo.create({ name: payload.name.trim() }, transactionContext);
    await transactionContext.commit();
    return crop;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const update = async function (id, payload) {
  const transactionContext = await sequelize.transaction();
  try {
    const crop = await cropRepo.update(id, payload, transactionContext);
    await transactionContext.commit();
    return crop;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

module.exports = {
  create,
  update
};
