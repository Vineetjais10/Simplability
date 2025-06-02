const { StatusCodes } = require('http-status-codes');
const { create: serviceCreate, update: serviceUpdate } = require('../../services/crop/crop.service');
const cropRepo = require('../../repositories/crop.repository');

const create = async function (req, res) {
  try {
    const crop = await serviceCreate(req.body);
    return res.success(crop, '', StatusCodes.CREATED);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const index = async function (req, res) {
  try {
    const crops = await cropRepo.index();
    return res.success(crops, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const remove = async function (req, res) {
  try {
    const { id } = req.params;
    const isRemoved = await cropRepo.remove(id);
    if (!isRemoved) {
      return res.error({ error: 'Crop not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    const { id } = req.params;
    const crop = await serviceUpdate(id, req.body);
    if (!crop) {
      return res.error({ error: 'Crop not found' }, '', StatusCodes.NOT_FOUND);
    }
    return res.success(crop, 'Crop updated successfully', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const crop = await cropRepo.view(id);
    return res.success(crop, '', StatusCodes.OK);
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
