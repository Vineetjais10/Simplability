const { StatusCodes } = require('http-status-codes');
const {
  login: serviceLogin,
  refresh: serviceRefresh,
  logout: serviceLogout,
  forgotPassword: forgotPasswordService,
  resetPassword: resetPasswordService
} = require('../../services/auth/auth.service');
const authValidator = require('../../validators/auth.validator');
const commonHelper = require('../../helpers/errors/common.helper');
const { parseValidationErrors } = require('../../helpers/utils/utils.helpers');
const errorMessage = require('../../constants/errorMessage.constant');
const { logToEventQueue } = require('../../producers/eventlogs.producer');

const login = async function (req, res) {
  try {
    const response = await serviceLogin(req.body);
    logToEventQueue(req, response?.logData);
    delete response.logData;
    return res.success(response, 'Login successful!', StatusCodes.OK);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'login' });
    return res.error({ details: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

const logout = async function (req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { refresh_token: refreshToken } = req.body;
    const logData = await serviceLogout(token, refreshToken);
    logToEventQueue(req, logData);
    return res.success({}, 'Logged out successfully', StatusCodes.OK);
  } catch (error) {
    logToEventQueue(req, { error: { error: error.message }, resource: 'logout' });
    return res.error({ details: error.message }, '', error.code || StatusCodes.BAD_REQUEST);
  }
};

const refresh = async function (req, res) {
  try {
    const refresh_token = req.headers.authorization?.split(' ')[1];
    if (!refresh_token) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Access denied. No token provided.' });
    }
    const accessToken = await serviceRefresh(refresh_token);
    return res.success({ accessToken: accessToken }, 'token refreshed successfully', StatusCodes.OK);
  } catch (error) {
    return res.error({ details: errorMessage.INVALID_TOKEN }, 'Failed to retrieve user', error.code || StatusCodes.BAD_REQUEST);
  }
};

const forgotPassword = async function (req, res) {
  try {
    const validationError = authValidator.forgotPasswordSchema.validate(req.body, { abortEarly: false });

    if (validationError.error) {
      throw validationError.error;
    }

    const logData = await forgotPasswordService(req.body);
    logToEventQueue(req, logData);
    return res.success(null, 'Link has been sent successfully to your email, please check!', StatusCodes.OK);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.message }, resource: 'forgot_password' });
      commonHelper.errorHandler(res, 'Validation error', StatusCodes.UNPROCESSABLE_ENTITY, parseValidationErrors(error?.details));
    } else {
      logToEventQueue(req, { error: { error: error.message }, resource: 'forgot_password' });
      return res.error({ details: error.message }, 'Failed send reset password link', error.code || StatusCodes.BAD_REQUEST);
    }
  }
};

const resetPassword = async function (req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Authorization Token is missing!');
    }

    const validationError = authValidator.resetPasswordSchema.validate(req.body, { abortEarly: false });

    if (validationError.error) {
      throw validationError.error;
    }

    const logData = await resetPasswordService(req.body, token);
    logToEventQueue(req, logData);
    return res.success(null, 'Password updated successfully!', StatusCodes.OK);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logToEventQueue(req, { error: { error: error.message }, resource: 'reset_password' });
      commonHelper.errorHandler(res, 'Validation error', StatusCodes.UNPROCESSABLE_ENTITY, parseValidationErrors(error?.details));
    } else {
      logToEventQueue(req, { error: { error: error.message }, resource: 'reset_password' });
      return res.error({ details: error.message }, 'Failed during reset password', error.code || StatusCodes.BAD_REQUEST);
    }
  }
};

module.exports = {
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword
};
