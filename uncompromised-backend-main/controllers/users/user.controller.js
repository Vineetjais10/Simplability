const { StatusCodes } = require('http-status-codes');
const {
  create: serviceCreate,
  update: serviceUpdate,
  updatePassword: serviceUpdatePassword,
  index: userGetService
} = require('../../services/user/user.service');
const userRepo = require('../../repositories/user.repository');
const { userSerializer, usersSerializer } = require('../../serializers/user/user.serializer');
const { getPagination, getPaginationMeta } = require('../../helpers/utils/utils.helpers');
const usersValidator = require('../../validators/users.validator');
const commonHelper = require('../../helpers/errors/common.helper');
const { replaceEmptyStringsWithNull } = require('../../helpers/utils/utils.helpers');
const { sequelize, User } = require('../../models');
const status = require('../../constants/status.constant');
const { buildConditionsAndGenerateErrors } = require('../../helpers/user/user.helper');
const { logToEventQueue } = require('../../producers/eventlogs.producer');
const {
  ROLES: { PLANNER }
} = require('../../constants/common.constant');
const { Op } = require('sequelize');

const create = async function (req, res) {
  try {
    const userId = req?.userId?.id || null;
    const { username, phone_number, email } = req.body;

    const fieldsToCheck = { username, phone_number, email };
    const { whereConditions } = buildConditionsAndGenerateErrors(fieldsToCheck);

    const existingUsers = await User.findAll({
      where: whereConditions,
      attributes: ['username', 'phone_number', 'email', 'deleted_at'],
      paranoid: false
    });

    const { errors } = buildConditionsAndGenerateErrors(fieldsToCheck, existingUsers);
    if (errors.length > 0) {
      throw {
        name: 'ValidationError',
        errors
      };
    }

    const { user, logData } = await serviceCreate(req.body, userId);
    logToEventQueue(req, logData);
    const serializedUser = userSerializer(user);

    return res.success(serializedUser, '', StatusCodes.CREATED);
  } catch (error) {
    if (error?.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.errors }, resource: 'users' });
      return res.error({ details: error.errors }, '', error.code || StatusCodes.CONFLICT);
    } else {
      logToEventQueue(req, { error: { error: error.message }, resource: 'users' });
      return res.error({ details: error.errors }, '', error.code || StatusCodes.CONFLICT);
    }
  }
};

const index = async function (req, res) {
  try {
    const pagination = getPagination(req.query);
    const users = await userGetService(req.query, pagination);
    const serializedUsers = usersSerializer(users.rows);

    const meta = getPaginationMeta(users.count, pagination.limit, pagination.page);

    return res.status(StatusCodes.OK).json({
      data: serializedUsers,
      total: meta.totalRecords,
      current_page: meta.currentPage,
      total_pages: meta.totalPages
    });
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const remove = async function (req, res) {
  const transactionContext = await sequelize.transaction();
  try {
    const { id } = req.params;
    let user = await userRepo.view(id);
    if (!user) {
      throw new Error('User not found');
    }
    const isRemoved = await userRepo.remove(id, transactionContext);
    if (!isRemoved) {
      logToEventQueue(req, { error: { error: { error: 'User not found.' } }, resource: 'users' });
      return res.error({ error: 'User not found.' }, '', StatusCodes.NOT_FOUND);
    }

    user.status = status.STATUS_ARCHIVED;
    await user.save({ transaction: transactionContext });
    await transactionContext.commit();

    user = user.get({ plain: true });
    delete user.password;
    logToEventQueue(req, { old_data: user, resource: 'users' });

    return res.success({}, '', StatusCodes.OK);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'users' });
    await transactionContext.rollback();
    return res.error({ error: error.message }, '', StatusCodes.BAD_REQUEST);
  }
};

const update = async function (req, res) {
  try {
    replaceEmptyStringsWithNull(req.body);
    const { username, phone_number, email } = req.body;
    const { id } = req.params;
    // do not allow planner to update other users details
    if (req.userId?.roles?.includes(PLANNER) && req.userId.id !== id) {
      return res.error({ error: "You don't have permission to access this resource." }, '', StatusCodes.FORBIDDEN);
    }

    const user = await userRepo.view(id);

    if (!user) {
      logToEventQueue(req, { error: { error: 'User not found' }, resource: 'users' });
      return res.error({ error: 'User not found' }, '', StatusCodes.NOT_FOUND);
    }

    const role = user?.Roles?.[0]?.name;

    let validationError;
    if (role === 'field_supervisor') {
      validationError = usersValidator.fieldSupervisorUpdateSchema.validate(req.body, { abortEarly: false });
    } else {
      validationError = usersValidator.userUpdateSchema.validate(req.body, { abortEarly: false });
    }

    if (validationError.error) {
      throw validationError.error;
    }

    const fieldsToCheck = { username, phone_number, email };
    const { whereConditions } = buildConditionsAndGenerateErrors(fieldsToCheck);

    const existingUsers = await User.findAll({
      where: { ...whereConditions, id: { [Op.not]: id } },
      attributes: ['username', 'phone_number', 'email', 'deleted_at'],
      paranoid: false
    });

    const { errors } = buildConditionsAndGenerateErrors(fieldsToCheck, existingUsers);

    if (errors.length > 0) {
      throw {
        name: 'CustomValidationError',
        errors
      };
    }

    const { user: updatedUser, logData } = await serviceUpdate(id, req.body);
    if (!updatedUser) {
      logToEventQueue(req, { error: { error: 'User not found' }, resource: 'users' });
      return res.error({ error: 'User not found' }, '', StatusCodes.NOT_FOUND);
    }
    logToEventQueue(req, logData);

    const serializedUser = userSerializer(updatedUser);
    return res.success(serializedUser, 'User updated successfully', StatusCodes.OK);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.message }, resource: 'users' });
      commonHelper.errorHandler(
        res,
        'Validation error',
        422,
        error?.details?.map(detail => ({
          field: detail.context.key,
          message: detail.message.replaceAll('"', '')
        }))
      );
    } else if (error?.name === 'CustomValidationError') {
      logToEventQueue(req, { error: { error: error.errors }, resource: 'users' });
      return res.error({ details: error.errors }, '', error.code || StatusCodes.CONFLICT);
    } else {
      logToEventQueue(req, { error: { error: error.errors }, resource: 'users' });
      return res.error({ details: error.errors }, '', StatusCodes.BAD_REQUEST);
    }
  }
};

const view = async function (req, res) {
  try {
    const { id } = req.params;
    const user = await userRepo.findByIdWithRoles(id);
    const serializedUser = userSerializer(user);
    return res.success(serializedUser, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.NOT_FOUND);
  }
};

const me = async function (req, res) {
  try {
    const id = req.userId.id;
    const user = await userRepo.findByIdWithRoles(id);
    const serializedUser = userSerializer(user);
    return res.success(serializedUser, '', StatusCodes.OK);
  } catch (error) {
    return res.error({ error: error.message }, '', StatusCodes.NOT_FOUND);
  }
};

const updatePassword = async function (req, res) {
  try {
    const id = req.userId.id;
    let { oldUser, user } = await serviceUpdatePassword(id, req.body);
    oldUser = oldUser.get({ plain: true });
    user = user.get({ plain: true });
    delete user.password;
    delete oldUser.password;
    req.body = null;
    logToEventQueue(req, { new_data: user, old_data: oldUser, resource: 'users' });

    return res.success({}, 'Password updated successfully', StatusCodes.OK);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'users' });
    return res.error({ error: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

module.exports = {
  create,
  index,
  remove,
  update,
  view,
  me,
  updatePassword
};
