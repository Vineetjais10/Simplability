const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');

const generateAccessToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
};

const generateRefreshToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
};

const verifyToken = (token, type) => {
  const secretKeys = {
    refresh: process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    'reset-password': process.env.JWT_URL_TOKEN_SECRET_KEY,
    default: process.env.JWT_ACCESS_TOKEN_SECRET_KEY
  };

  const secretKey = secretKeys[type] || secretKeys.default;
  return jwt.verify(token, secretKey);
};

const comparePassword = async (password, user) => {
  const hasedPasswordRoles = ['admin', 'planner', 'field_manager'];

  const userRole = user.Roles.map(role => role.name);

  if (hasedPasswordRoles.includes(userRole[0])) {
    return await bcrypt.compare(password, user.password);
  }

  const bytes = CryptoJS.AES.decrypt(user.password, process.env.AES_SECRET_KEY);
  const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
  return password === originalPassword;
};

const generateResetPasswordToken = id => {
  return jwt.sign({ id }, process.env.JWT_URL_TOKEN_SECRET_KEY, { expiresIn: process.env.URL_TOKEN_EXPIRATION });
};

const convertExpiration = expirationInMs => {
  const totalMinutes = Math.floor(expirationInMs / (1000 * 60));
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (minutes === 0) {
    return `${hours} hrs`;
  }
  return `${hours} hrs ${minutes} mins`;
};

module.exports = {
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  comparePassword,
  generateResetPasswordToken,
  convertExpiration
};
