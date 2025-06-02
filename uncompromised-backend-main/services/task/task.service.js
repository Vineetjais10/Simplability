const { sequelize } = require('../../models');
const taskRepo = require('../../repositories/task.repository');

const create = async function (payload) {
  const transactionContext = await sequelize.transaction();
  try {
    const task = await taskRepo.create({ name: payload.name.trim() }, transactionContext);
    await transactionContext.commit();
    return task;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const update = async function (id, payload) {
  const transactionContext = await sequelize.transaction();
  try {
    const task = await taskRepo.update(id, payload, transactionContext);
    await transactionContext.commit();
    return task;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

module.exports = {
  create,
  update
};
