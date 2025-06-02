const { StatusCodes } = require('http-status-codes');
const { create: serviceCreate, update: serviceUpdate } = require('../../services/task/task.service');
const taskRepo = require('../../repositories/task.repository');

const create = async function (req, res) {
  try {
    const task = await serviceCreate(req.body);
    return res.success(task, '', StatusCodes.CREATED);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const index = async function (req, res) {
  try {
    const tasks = await taskRepo.index();
    return res.success(tasks, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const remove = async function (req, res) {
  try {
    const { id } = req.params;
    const isRemoved = await taskRepo.remove(id);
    if (!isRemoved) {
      return res.error({ error: 'Task not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    const { id } = req.params;
    const task = await serviceUpdate(id, req.body);
    if (!task) {
      return res.error({ error: 'Task not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success(task, 'Task updated successfully', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const task = await taskRepo.view(id);
    return res.success(task, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.NOT_FOUND);
  }
};

module.exports = {
  create,
  index,
  remove,
  update,
  view
};
