const { EventLog } = require('../models');
const { sequelizeErrorParsor } = require('../helpers/utils/utils.helpers');

const bulkCreate = async function (data) {
  try {
    await EventLog.bulkCreate(data);
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

const create = async function (data) {
  try {
    await EventLog.create(data);
  } catch (error) {
    const err = sequelizeErrorParsor(error) || error;
    throw err;
  }
};

module.exports = { bulkCreate, create };
