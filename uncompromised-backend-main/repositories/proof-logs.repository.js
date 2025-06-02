const { ProofLogs } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const createProofLog = async (logData, transaction) => {
  try {
    const proofLog = await ProofLogs.create(logData, { transaction });
    return proofLog;
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

module.exports = {
  createProofLog
};
