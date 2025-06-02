const { StatusCodes } = require('http-status-codes');
const { verifyToken } = require('../helpers/auth/auth.helper');
const errorMessage = require('../constants/errorMessage.constant');
const userRepo = require('../repositories/user.repository');
const redisOperation = require('../services/redis/redis.service');

const authenticate = async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.error({ details: 'Access denied. Token required!' }, '', StatusCodes.UNAUTHORIZED);
  }

  try {
    // throw error if blacklisted
    const token = await redisOperation.redisGet(accessToken);
    if (token === 'blacklisted') {
      throw new Error(errorMessage.INVALID_TOKEN);
    }

    const decodedId = verifyToken(accessToken, 'access');
    // check if user is exists in database
    let user = await userRepo.view(decodedId.id, true);
    if (user) {
      user = user.get({ plain: true });
      user.roles = user.Roles.map(role => role.name);
      req.userId = { ...decodedId, ...user };
    } else {
      const error = new Error('User not found');
      error.code = StatusCodes.NOT_FOUND;
      throw error;
    }
    next();
  } catch (error) {
    console.log('error', error);
    return res.error({ details: errorMessage.INVALID_TOKEN }, '', StatusCodes.UNAUTHORIZED);
  }
};

module.exports = authenticate;
