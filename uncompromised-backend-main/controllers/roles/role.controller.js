const { StatusCodes } = require('http-status-codes');
const roleRepo = require('../../repositories/role.repository');
const { create: serviceCreate, update: serviceUpdate } = require('../../services/role/role.service');

const create = async function (req, res) {
  try {
    const role = await serviceCreate(req.body);
    return res.success(role, '', StatusCodes.CREATED);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const index = async function (req, res) {
  try {
    const roles = await roleRepo.repoIndex();
    return res.success(roles, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const remove = async function (req, res) {
  try {
    const { id } = req.params;
    const isRemoved = await roleRepo.remove(id);
    if (!isRemoved) {
      return res.error({ error: 'Role not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    const { id } = req.params;
    const isUpdated = await serviceUpdate(id, req.body);
    if (!isUpdated) {
      return res.error({ error: 'Role not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success({}, 'Role updated successfully', StatusCodes.StatusCodes.ACCEPTED);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const role = await roleRepo.findByIdWithRoles(id);
    return res.success(role, '', StatusCodes.OK);
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
