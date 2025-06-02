const { sequelize } = require('../../models');
const userRepo = require('../../repositories/user.repository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  comparePassword,
  generateResetPasswordToken,
  convertExpiration
} = require('../../helpers/auth/auth.helper');
const redisOperation = require('../redis/redis.service');
const { sendMail } = require('../../helpers/notifications/mail.helper');
const bcrypt = require('bcrypt');
const errorMessage = require('../../constants/errorMessage.constant');
const { StatusCodes } = require('http-status-codes');
const { queueLogger } = require('../../config/loggerConfig');

const login = async function (payload) {
  const transactionContext = await sequelize.transaction();
  const logData = [];
  try {
    const { password } = payload;
    let user;
    if (payload.email) {
      user = await userRepo.findByEmail(payload.email, transactionContext);
    }

    if (payload.username) {
      user = await userRepo.findByUsername(payload.username, transactionContext);
    }

    if (!user) {
      throw new Error('Invalid Credentials!');
    }

    if (!(await comparePassword(password, user))) {
      throw new Error('Invalid Credentials!');
    }

    let userDetails = await userRepo.findByIdWithRoles(user.id);
    if (!userDetails) {
      throw new Error('User not found');
    }
    userDetails = userDetails.get({ plain: true });
    const roles = userDetails.Roles.map(role => role.name);
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    delete userDetails?.password;
    logData.push({ user_id: userDetails?.id, new_data: userDetails, resource: 'login' });

    await transactionContext.commit();
    return { accessToken, refreshToken, roles, logData };
  } catch (error) {
    // Rollback transaction on error
    await transactionContext.rollback();
    throw error;
  }
};

const refresh = async function (token) {
  const isTokenBlacklisted = await redisOperation.redisGet(token);
  if (isTokenBlacklisted === 'blacklisted') {
    const error = new Error('Unauthorized');
    error.code = StatusCodes.UNAUTHORIZED;
    throw error;
  }

  const decodedData = verifyToken(token, 'refresh');

  const user = await userRepo.view(decodedData.id, false);
  if (!user) {
    const error = new Error('Invalid refresh token');
    error.code = StatusCodes.UNAUTHORIZED;
    throw error;
  }

  return generateAccessToken(decodedData.id, decodedData.username);
};

const forgotPassword = async function (payload) {
  const logData = [];
  const { email } = payload;
  let user = await userRepo.findByEmail(email);
  if (!user) {
    const error = new Error('User not found');
    error.code = StatusCodes.NOT_FOUND;
    throw error;
  }

  if (!['admin', 'planner'].includes(user?.Roles?.[0]?.name)) {
    throw new Error('Not allowed to access this resource!');
  }

  const token = generateResetPasswordToken(user.id);

  await redisOperation.redisSet(user.id, token, process.env.REDIS_TTL, false);

  const baseUrl = process.env.APP_URL?.replace(/\/workplace$/, '');

  const resetLink = `${baseUrl}/reset-password?token=${token}`;
  const validTime = convertExpiration(process.env.URL_TOKEN_EXPIRATION);
  sendMail({
    to: email,
    subject: `Reset Password request!`,
    message: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link is valid for ${validTime}.</p>`
  });

  user = user.get({ plain: true });
  delete user?.password;
  logData.push({ old_data: user, resource: 'forgot_password' });
  return logData;
};

const resetPassword = async function (payload, token) {
  const transactionContext = await sequelize.transaction();
  const logData = [];
  try {
    const { new_password, confirm_password } = payload;
    if (new_password !== confirm_password) {
      throw new Error('New Password and Confirm Password should be same.');
    }

    let decoded;
    try {
      decoded = verifyToken(token, 'reset-password');
    } catch (error) {
      queueLogger.error(error);
      throw new Error(errorMessage.INVALID_TOKEN);
    }

    if (!decoded) {
      throw new Error(errorMessage.INVALID_TOKEN);
    }

    const redisToken = await redisOperation.redisGet(decoded.id);

    if (!redisToken || redisToken?.trim() !== token?.trim()) {
      throw new Error(errorMessage.INVALID_TOKEN);
    }

    const hashedPassword = await bcrypt.hash(new_password, parseInt(process.env.SALT_ROUNDS));
    await userRepo.update(decoded.id, { password: hashedPassword }, transactionContext);
    await redisOperation.redisDelete(decoded.id);

    delete decoded?.iat;
    delete decoded?.exp;
    logData.push({ new_data: decoded, resource: 'reset_password' });

    await transactionContext.commit();
    return logData;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
};

const logout = async function (token, refreshToken) {
  const logData = [];
  if (!refreshToken) {
    throw new Error('Refresh token is missing');
  }

  const decodedToken = verifyToken(token);
  const decodedRefreshToken = verifyToken(refreshToken, 'refresh');

  const tokenTtl = Math.floor(decodedToken.exp - Date.now() / 1000);
  const refreshTokenTtl = Math.floor(decodedRefreshToken.exp - Date.now() / 1000);

  delete decodedToken?.exp;
  delete decodedToken?.iat;
  logData.push({ old_data: decodedToken, resource: 'logout' });

  await Promise.all([
    redisOperation.redisSet(token, 'blacklisted', tokenTtl, false),
    redisOperation.redisSet(refreshToken, 'blacklisted', refreshTokenTtl, false)
  ]);

  return logData;
};

module.exports = { login, refresh, forgotPassword, resetPassword, logout };
