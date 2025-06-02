const { ValidationError } = require('sequelize');

const sequelizeErrorParsor = error => {
  if (error instanceof ValidationError) {
    const returnError = new Error('validation error');
    // Handle Sequelize validation error
    returnError.errors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    returnError.isDataBaseError = true;
    return returnError;
  }
  return false;
};

/**
 * Generate pagination details for Sequelize queries
 * @param {Object} query - Express query object
 * @param {number} defaultLimit - Default records per page
 * @returns {Object} Pagination details (limit, offset, page)
 */
const getPagination = (query, defaultLimit = 10) => {
  const page = Number(query.pagination?.page) || 1;
  const limit = Number(query.pagination?.limit) || defaultLimit;
  const offset = (page - 1) * limit;

  return { limit, offset, page };
};

/**
 * Generate metadata for paginated responses
 * @param {number} totalRecords - Total number of records
 * @param {number} limit - Records per page
 * @param {number} page - Current page
 * @returns {Object} Meta object with pagination info
 */
const getPaginationMeta = (totalRecords, limit, page) => {
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    totalRecords,
    totalPages,
    currentPage: page,
    limit
  };
};

/**
 * Replaces all empty string values in the provided object with null.
 * @param {Object} payload - The object to process.
 * @returns {Object} - The updated object.
 */
const replaceEmptyStringsWithNull = payload => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  Object.keys(payload).forEach(key => {
    if (payload[key] === '') {
      payload[key] = null;
    }
  });

  return payload;
};

const parseValidationErrors = errorDetails => {
  return errorDetails?.map(detail => ({
    field: detail.context.key,
    message: detail.message.replaceAll('"', '')
  }));
};

const isTransientError = error => {
  const transientErrorMessages = ['Redis connection lost', 'Database timeout'];
  return transientErrorMessages.some(msg => error.message.includes(msg));
};

const trimString = str => {
  return str?.trim();
};

module.exports = {
  sequelizeErrorParsor,
  getPagination,
  getPaginationMeta,
  replaceEmptyStringsWithNull,
  parseValidationErrors,
  isTransientError,
  trimString
};
