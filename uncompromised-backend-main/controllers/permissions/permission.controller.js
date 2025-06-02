const { StatusCodes } = require('http-status-codes');
const permissionRepo = require('../../repositories/permission.repository');

const create = async function (req, res) {
  try {
    const permission = await permissionRepo.create(req.body);
    return res.success(permission, '', StatusCodes.CREATED);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const index = async function (req, res) {
  try {
    const permissions = await permissionRepo.index();
    return res.success(permissions, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const remove = async function (req, res) {
  try {
    const { id } = req.params;
    const isRemoved = await permissionRepo.remove(id);
    if (!isRemoved) {
      return res.error({ error: 'Permission not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    const { id } = req.params;
    const isUpdated = await permissionRepo.update(id, req.body);
    if (!isUpdated) {
      return res.error({ error: 'Permission not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success({}, 'Permission updated successfully', StatusCodes.StatusCodes.ACCEPTED);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const permission = await permissionRepo.view(id);
    return res.success(permission, '', StatusCodes.OK);
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
