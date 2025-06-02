const { StatusCodes } = require('http-status-codes');
const { create: serviceCreate, update: serviceUpdate, farmDetail: serviceFarmView, removeFarm: serviceRemove } = require('../../services/farm/farm.service');
const farmRepo = require('../../repositories/farm.repository');
const { getPagination, getPaginationMeta } = require('../../helpers/utils/utils.helpers');
const farmsValidator = require('../../validators/farms.validator');
const commonHelper = require('../../helpers/errors/common.helper');
const { replaceEmptyStringsWithNull } = require('../../helpers/utils/utils.helpers');
const { logToEventQueue } = require('../../producers/eventlogs.producer');

const create = async function (req, res) {
  try {
    replaceEmptyStringsWithNull(req.body);
    const validationError = farmsValidator.farmSchema.validate(req.body, { abortEarly: false });

    if (validationError.error) {
      throw validationError.error;
    }

    const { farm, logData } = await serviceCreate(req);

    logToEventQueue(req, logData);

    return res.success(farm, '', StatusCodes.CREATED);
  } catch (error) {
    const customMessages = {
      name: 'The farm name already exists.'
    };

    if (error.isDataBaseError) {
      const customizedErrors = commonHelper.DbErrorHandler(error, customMessages);
      logToEventQueue(req, { resource: 'farms', error: { error: customizedErrors } });
      return res.error({ details: customizedErrors }, '', error.code || StatusCodes.CONFLICT);
    } else if (error.name === 'ValidationError') {
      logToEventQueue(req, { resource: 'farms', error: { error: error.message } });
      commonHelper.errorHandler(
        res,
        'Validation error',
        422,
        error.details.map(detail => ({
          field: detail.context.key,
          message: detail.message.replaceAll('"', '')
        }))
      );
    } else {
      logToEventQueue(req, { resource: 'farms', error: { error: error.errors } });
      return res.error({ details: error.errors }, '', error.code || StatusCodes.CONFlICT);
    }
  }
};

const index = async function (req, res) {
  try {
    const { limit, offset, page } = getPagination(req.query);

    const farms = await farmRepo.index(limit, offset);

    const meta = getPaginationMeta(farms.count, limit, page);

    return res.status(StatusCodes.OK).json({
      data: farms.rows,
      total: meta.totalRecords,
      current_page: meta.currentPage,
      total_pages: meta.totalPages
    });
  } catch (error) {
    return res.error({ details: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const remove = async function (req, res) {
  try {
    const { id } = req.params;
    const { isRemoved, logData } = await serviceRemove(id);
    if (!isRemoved) {
      logToEventQueue(req, { error: { error: 'Farm not found' }, resource: 'farms' });
      return res.error({ error: 'Farm not found' }, '', StatusCodes.NOT_FOUND);
    }
    logToEventQueue(req, logData);
    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'farms' });
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    replaceEmptyStringsWithNull(req.body);
    const { id } = req.params;

    const validationError = farmsValidator.farmUpdateSchema.validate(req.body, { abortEarly: false });

    if (validationError.error) {
      throw validationError.error;
    }

    const { farmData: farm, logData } = await serviceUpdate(id, req);
    if (!farm) {
      logToEventQueue(req, { error: { error: 'Farm not found' }, resource: 'farms' });
      return res.error({ error: 'Farm not found' }, '', StatusCodes.NOT_FOUND);
    }
    logToEventQueue(req, logData);

    return res.success(farm, 'Farm updated successfully', StatusCodes.OK);
  } catch (error) {
    const customMessages = {
      name: 'The farm name already exists.'
    };

    if (error.isDataBaseError) {
      const customizedErrors = commonHelper.DbErrorHandler(error, customMessages);
      logToEventQueue(req, { error: { error: customizedErrors }, resource: 'farms' });
      return res.error({ details: customizedErrors }, '', error.code || StatusCodes.CONFLICT);
    } else if (error.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.message }, resource: 'farms' });
      commonHelper.errorHandler(
        res,
        'Validation error',
        422,
        error.details.map(detail => ({
          field: detail.context.key,
          message: detail.message.replaceAll('"', '')
        }))
      );
    } else {
      logToEventQueue(req, { error: { error: error.errors }, resource: 'farms' });
      return res.error({ details: error.errors }, '', error.code || StatusCodes.CONFLICT);
    }
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const farm = await serviceFarmView(id);
    return res.success(farm, '', StatusCodes.OK);
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
