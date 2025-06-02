const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { Op } = require('sequelize');

const generateUsername = (name = '') => {
  const baseName = name ? name.replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substring(2, 8);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseName.toLowerCase()}${randomSuffix}`;
};

const generatePasswordFactory = async (role, password) => {
  const hasedPasswordRoles = ['admin', 'planner', 'field_manager'];

  if (hasedPasswordRoles.includes(role)) {
    return await generateHashedPassword(password);
  }

  return await generateEncryptedPassword(password);
};

const generateHashedPassword = async password => {
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
};

const generateEncryptedPassword = async password => {
  const ciphertext = CryptoJS.AES.encrypt(password, process.env.AES_SECRET_KEY).toString();
  return ciphertext;
};

const buildConditionsAndGenerateErrors = (fields, existingUsers = []) => {
  const whereConditions = { [Op.or]: [] };
  const errors = [];

  Object?.entries(fields)?.forEach(([key, value]) => {
    if (value) {
      whereConditions[Op.or]?.push({ [key]: value });

      existingUsers?.forEach(user => {
        if (user[key] === value) {
          errors?.push({
            field: key,
            message: `This ${key?.replace('_', ' ')} already exists.`
          });
        }
      });
    }
  });

  whereConditions[Op.or]?.push({
    deleted_at: { [Op.or]: [null, { [Op.ne]: null }] }
  });

  return { whereConditions, errors };
};

module.exports = {
  generateUsername,
  generatePasswordFactory,
  buildConditionsAndGenerateErrors
};
