const { Task } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const index = async function () {
  const tasks = await Task.findAll({
    attributes: { exclude: ['deleted_at'] },
    order: [['name', 'ASC']]
  });
  return tasks;
};

const create = async function ({ name }, transaction) {
  try {
    const task = await Task.create(
      {
        name: name
      },
      {
        transaction
      }
    );
    return task;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const update = async function (id, payload, trnxContext) {
  try {
    await Task.update(payload, { where: { id: id }, trnxContext });
    return module.exports.view(id);
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const remove = async function (id, transaction) {
  const removedRow = await Task.destroy({ where: { id } }, { transaction });
  return !(removedRow === 0);
};

const findByName = async function (name, transaction) {
  const task = await Task.findOne({ where: { name }, transaction });
  return task;
};

const view = async function (id) {
  const task = await Task.findByPk(id);
  return task;
};

const findOrCreateTask = async function (name, payload, transaction) {
  try {
    const [task, isCreated] = await Task.findOrCreate({
      where: { name },
      defaults: payload,
      transaction
    });
    return { task, isCreated };
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const getAll = async function () {
  const tasks = await Task.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  });
  return tasks;
};

module.exports = {
  index,
  create,
  remove,
  update,
  findByName,
  view,
  findOrCreateTask,
  getAll
};
